import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { calculatePay, projectSales } from "@/lib/payEngine";
import { Camera, Clock, MapPin, Package, CheckCircle, ChevronRight, AlertTriangle, Star, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";

type ShiftStep = "idle" | "starting" | "blind_start" | "active" | "end_report" | "deposit" | "summary";

const PhotographerApp = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<ShiftStep>("idle");
  const [venues, setVenues] = useState<any[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<string>("");
  const [activeShift, setActiveShift] = useState<any>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [checkInDue, setCheckInDue] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [checkInSales, setCheckInSales] = useState("");
  const [consecutiveDismissals, setConsecutiveDismissals] = useState(0);

  // Inventory form state
  const [invForm, setInvForm] = useState({
    total_frames: "", broken_frames: "0", total_paper_sets: "",
    broken_paper_sets: "0", dnp_prints_remaining: "",
  });
  const [endForm, setEndForm] = useState({
    total_frames: "", broken_frames: "0", total_paper_sets: "",
    broken_paper_sets: "0", dnp_prints_remaining: "", total_sales: "",
  });

  // Pay summary
  const [payResult, setPayResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Fetch venues on mount
  useEffect(() => {
    supabase.from("venues").select("*").eq("is_active", true).then(({ data }) => {
      if (data) setVenues(data);
    });
  }, []);

  // Check for existing active shift
  useEffect(() => {
    if (!user) return;
    supabase
      .from("shifts")
      .select("*")
      .eq("photographer_id", user.id)
      .eq("status", "active")
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setActiveShift(data);
          setStep("active");
        }
      });
  }, [user]);

  // Timer for active shift
  useEffect(() => {
    if (step !== "active" || !activeShift?.start_time) return;
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - new Date(activeShift.start_time).getTime()) / 1000);
      setElapsedSeconds(elapsed);
      // Check-in every 30 minutes
      if (elapsed > 0 && elapsed % 1800 < 2 && !showCheckIn) {
        setCheckInDue(true);
        setShowCheckIn(true);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [step, activeShift, showCheckIn]);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  // ---- STEP: Start Shift ----
  const handleStartShift = async () => {
    if (!user || !selectedVenue) return;
    setError("");
    setSubmitting(true);

    // Check no other active shift today
    const { data: existing } = await supabase
      .from("shifts")
      .select("id")
      .eq("photographer_id", user.id)
      .in("status", ["pending", "active"])
      .limit(1);

    if (existing && existing.length > 0) {
      setError("You already have an active shift today.");
      setSubmitting(false);
      return;
    }

    // Get GPS
    let gpsLat = 0, gpsLng = 0;
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true })
      );
      gpsLat = pos.coords.latitude;
      gpsLng = pos.coords.longitude;
    } catch {
      // GPS optional for now — in production would block
    }

    const venue = venues.find((v) => v.id === selectedVenue);

    const { data: shift, error: shiftErr } = await supabase
      .from("shifts")
      .insert({
        venue_id: selectedVenue,
        photographer_id: user.id,
        status: "pending" as const,
        start_time: new Date().toISOString(),
        is_business_trip: venue?.is_business_trip || false,
        gps_lat: gpsLat,
        gps_lng: gpsLng,
      })
      .select()
      .single();

    if (shiftErr) {
      setError(shiftErr.message);
      setSubmitting(false);
      return;
    }

    setActiveShift(shift);
    setStep("blind_start");
    setSubmitting(false);
  };

  // ---- STEP: Blind Start Inventory ----
  const handleBlindStart = async () => {
    if (!activeShift) return;
    setSubmitting(true);
    setError("");

    const { error: invErr } = await supabase.from("inventory_start").insert({
      shift_id: activeShift.id,
      total_frames: parseInt(invForm.total_frames),
      broken_frames: parseInt(invForm.broken_frames),
      total_paper_sets: parseInt(invForm.total_paper_sets),
      broken_paper_sets: parseInt(invForm.broken_paper_sets),
      dnp_prints_remaining: parseInt(invForm.dnp_prints_remaining),
    });

    if (invErr) { setError(invErr.message); setSubmitting(false); return; }

    // Activate shift
    await supabase.from("shifts").update({ status: "active" as const }).eq("id", activeShift.id);
    setActiveShift({ ...activeShift, status: "active" });
    setStep("active");
    setSubmitting(false);
  };

  // ---- STEP: 30-min Check-in ----
  const handleCheckIn = async (dismissed: boolean) => {
    if (!activeShift) return;

    await supabase.from("interval_logs").insert({
      shift_id: activeShift.id,
      cumulative_sales: dismissed ? null : parseInt(checkInSales) || 0,
      was_dismissed: dismissed,
    });

    if (dismissed) {
      setConsecutiveDismissals((d) => d + 1);
    } else {
      setConsecutiveDismissals(0);
    }

    setShowCheckIn(false);
    setCheckInDue(false);
    setCheckInSales("");
  };

  // ---- STEP: End Shift ----
  const handleEndShift = async () => {
    if (!activeShift) return;
    setSubmitting(true);
    setError("");

    const totalSales = parseInt(endForm.total_sales);
    const startFrames = parseInt(invForm.total_frames) || 0;
    const endFrames = parseInt(endForm.total_frames);

    const { error: endErr } = await supabase.from("inventory_end").insert({
      shift_id: activeShift.id,
      total_frames: endFrames,
      broken_frames: parseInt(endForm.broken_frames),
      total_paper_sets: parseInt(endForm.total_paper_sets),
      broken_paper_sets: parseInt(endForm.broken_paper_sets),
      dnp_prints_remaining: parseInt(endForm.dnp_prints_remaining),
      total_sales: totalSales,
      frames_sold_calculated: startFrames - endFrames,
    });

    if (endErr) { setError(endErr.message); setSubmitting(false); return; }

    // Calculate pay
    const hoursWorked = elapsedSeconds / 3600;
    const pay = calculatePay({
      totalSales,
      hoursWorked,
      hourlyRate: profile?.hourly_rate || 15,
      helperRatio: activeShift.helper_ratio || 0,
      isBusinessTrip: activeShift.is_business_trip,
    });

    // Update shift
    await supabase.from("shifts").update({
      status: "closed" as const,
      end_time: new Date().toISOString(),
      hours_worked: Math.round(hoursWorked * 100) / 100,
      total_sales: totalSales,
      commission_rate: pay.commissionRate,
      commission_pay: pay.commissionPay,
      hourly_pay: pay.hourlyPay,
      final_pay: pay.finalPay,
      overage_tip: pay.overageTip,
    }).eq("id", activeShift.id);

    setPayResult(pay);
    setStep("deposit");
    setSubmitting(false);
  };

  // ---- STEP: Deposit Photo ----
  const handleDepositPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !activeShift) return;
    setSubmitting(true);

    const path = `${user.id}/${activeShift.id}-deposit.jpg`;
    const { error: upErr } = await supabase.storage.from("shift-photos").upload(path, file);
    if (upErr) { setError(upErr.message); setSubmitting(false); return; }

    const { data: urlData } = supabase.storage.from("shift-photos").getPublicUrl(path);

    await supabase.from("deposits").insert({
      shift_id: activeShift.id,
      photographer_id: user.id,
      image_url: urlData.publicUrl,
    });

    setStep("summary");
    setSubmitting(false);
  };

  // Projection data for active shift display
  const currentProjection = activeShift
    ? projectSales(activeShift.total_sales || 0, elapsedSeconds / 60, 300)
    : null;

  const inputClass = "w-full bg-transparent border-b border-muted focus:border-primary py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none transition-colors duration-500";

  return (
    <div className="min-h-screen pt-24 pb-20 px-6">
      <div className="max-w-md mx-auto">
        <AnimatePresence mode="wait">
          {/* IDLE - Select Venue & Start */}
          {step === "idle" && (
            <motion.div key="idle" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary mb-4">Shift Control</p>
              <h1 className="font-display italic text-3xl tracking-[-0.04em] leading-[0.9] mb-8">
                Ready to <span className="text-gradient-primary">shoot?</span>
              </h1>

              <div className="space-y-4 mb-8">
                <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Select Venue</label>
                <div className="grid grid-cols-2 gap-3">
                  {venues.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVenue(v.id)}
                      className={`glass-card p-4 rounded-lg text-left transition-all duration-300 ${
                        selectedVenue === v.id ? "border-primary/50 bg-primary/5" : ""
                      }`}
                    >
                      <p className="font-mono text-xs font-bold">{v.name}</p>
                      <p className="font-mono text-[10px] text-muted-foreground mt-1">
                        {v.is_business_trip ? "Business Trip" : "Regular"}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="text-destructive text-xs font-mono mb-4">{error}</p>}

              <motion.button
                whileTap={{ scale: 0.98 }}
                disabled={!selectedVenue || submitting}
                onClick={handleStartShift}
                className="w-full glass-card py-4 rounded-lg font-mono text-[11px] uppercase tracking-[0.2em] text-primary hover:bg-primary/10 transition-all pulse-glow disabled:opacity-30 disabled:pulse-glow-none flex items-center justify-center gap-3"
              >
                <MapPin size={16} />
                {submitting ? "Verifying..." : "Start Shift"}
              </motion.button>
            </motion.div>
          )}

          {/* BLIND START - Inventory Count */}
          {step === "blind_start" && (
            <motion.div key="blind" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="flex items-center gap-3 mb-2">
                <Package size={20} className="text-primary" />
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary">Blind Start Inventory</p>
              </div>
              <h2 className="font-display italic text-2xl mb-2">Count everything.</h2>
              <p className="text-muted-foreground text-xs mb-8 leading-relaxed">
                Enter your physical count. Do not reference any previous numbers.
              </p>

              <div className="space-y-5">
                {[
                  { key: "total_frames", label: "Total Frames in Case" },
                  { key: "broken_frames", label: "Broken/Damaged Frames" },
                  { key: "total_paper_sets", label: "Total Paper Sets" },
                  { key: "broken_paper_sets", label: "Broken Paper Sets" },
                  { key: "dnp_prints_remaining", label: "DNP Prints Remaining" },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{field.label}</label>
                    <input
                      type="number"
                      required
                      value={invForm[field.key as keyof typeof invForm]}
                      onChange={(e) => setInvForm({ ...invForm, [field.key]: e.target.value })}
                      className={inputClass}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                ))}
              </div>

              {error && <p className="text-destructive text-xs font-mono mt-4">{error}</p>}

              <motion.button
                whileTap={{ scale: 0.98 }}
                disabled={submitting || !invForm.total_frames || !invForm.total_paper_sets || !invForm.dnp_prints_remaining}
                onClick={handleBlindStart}
                className="w-full glass-card py-4 rounded-lg font-mono text-[11px] uppercase tracking-[0.2em] text-primary hover:bg-primary/10 transition-all mt-8 pulse-glow disabled:opacity-30"
              >
                {submitting ? "Submitting..." : "Submit & Begin Shift"}
              </motion.button>
            </motion.div>
          )}

          {/* ACTIVE SHIFT */}
          {step === "active" && (
            <motion.div key="active" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="text-center mb-8">
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary mb-2">Shift Active</p>
                <p className="font-mono text-4xl text-foreground glow-text tabular-nums">{formatTime(elapsedSeconds)}</p>
                <p className="font-mono text-[10px] text-muted-foreground mt-2">
                  {venues.find((v) => v.id === activeShift?.venue_id)?.name || "—"}
                </p>
              </div>

              {/* Bonus Progress (hidden if helper locked) */}
              {activeShift?.helper_ratio < 50 && (
                <div className="glass-card rounded-xl p-5 mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Bonus Progress</p>
                    <p className="font-mono text-[10px] text-primary">40 frames</p>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, ((activeShift?.total_sales || 0) / 40) * 100)}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <p className="font-mono text-[10px] text-muted-foreground mt-2">
                    {activeShift?.total_sales || 0} / 40 frames
                  </p>
                </div>
              )}

              {activeShift?.helper_ratio >= 50 && (
                <div className="glass-card rounded-xl p-5 mb-6 border-l-2 border-l-amber-500">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-500">
                    Helper Active — Flat Rate Applied
                  </p>
                </div>
              )}

              {/* End Shift Button */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep("end_report")}
                className="w-full glass-card py-4 rounded-lg font-mono text-[11px] uppercase tracking-[0.2em] text-destructive hover:bg-destructive/10 transition-all"
              >
                End Shift
              </motion.button>
            </motion.div>
          )}

          {/* CHECK-IN MODAL */}
          {showCheckIn && (
            <motion.div
              key="checkin-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/90 backdrop-blur-xl flex items-center justify-center px-6"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="glass-card rounded-2xl p-8 w-full max-w-sm text-center"
              >
                <Clock size={32} className="text-primary mx-auto mb-4" />
                <p className="font-display italic text-xl mb-2">30-Minute Check-In</p>
                <p className="text-muted-foreground text-xs mb-6">How many total frames sold so far?</p>
                <input
                  type="number"
                  value={checkInSales}
                  onChange={(e) => setCheckInSales(e.target.value)}
                  className={`${inputClass} text-center text-2xl font-bold mb-6`}
                  placeholder="0"
                  min="0"
                  autoFocus
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => handleCheckIn(true)}
                    className="flex-1 glass-card py-3 rounded-lg font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={() => handleCheckIn(false)}
                    className="flex-1 glass-card py-3 rounded-lg font-mono text-[10px] uppercase tracking-[0.2em] text-primary hover:bg-primary/10 transition-all"
                  >
                    Submit
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* END REPORT */}
          {step === "end_report" && (
            <motion.div key="end" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="flex items-center gap-3 mb-2">
                <Package size={20} className="text-primary" />
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary">End Report</p>
              </div>
              <h2 className="font-display italic text-2xl mb-6">Final count.</h2>

              <div className="space-y-5">
                {[
                  { key: "total_frames", label: "Total Frames Remaining" },
                  { key: "broken_frames", label: "Broken/Damaged Frames" },
                  { key: "total_paper_sets", label: "Total Paper Sets" },
                  { key: "broken_paper_sets", label: "Broken Paper Sets" },
                  { key: "dnp_prints_remaining", label: "DNP Prints Remaining" },
                  { key: "total_sales", label: "Total Frames Sold" },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{field.label}</label>
                    <input
                      type="number"
                      required
                      value={endForm[field.key as keyof typeof endForm]}
                      onChange={(e) => setEndForm({ ...endForm, [field.key]: e.target.value })}
                      className={`${inputClass} ${field.key === "total_sales" ? "text-lg font-bold text-primary" : ""}`}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                ))}
              </div>

              {error && <p className="text-destructive text-xs font-mono mt-4">{error}</p>}

              <div className="flex gap-3 mt-8">
                <button onClick={() => setStep("active")} className="flex-1 glass-card py-4 rounded-lg font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Cancel
                </button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  disabled={submitting || !endForm.total_frames || !endForm.total_sales}
                  onClick={handleEndShift}
                  className="flex-1 glass-card py-4 rounded-lg font-mono text-[11px] uppercase tracking-[0.2em] text-primary hover:bg-primary/10 transition-all pulse-glow disabled:opacity-30"
                >
                  {submitting ? "Calculating..." : "Submit"}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* DEPOSIT PHOTO */}
          {step === "deposit" && (
            <motion.div key="deposit" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="text-center">
              <Upload size={48} className="text-primary mx-auto mb-6" />
              <h2 className="font-display italic text-2xl mb-2">Photograph the deposit.</h2>
              <p className="text-muted-foreground text-xs mb-8">Take a photo of the cash envelope before closing your shift.</p>

              <label className="glass-card py-4 px-8 rounded-lg font-mono text-[11px] uppercase tracking-[0.2em] text-primary hover:bg-primary/10 transition-all cursor-pointer pulse-glow inline-flex items-center gap-3">
                <Camera size={16} />
                {submitting ? "Uploading..." : "Take Photo"}
                <input type="file" accept="image/*" capture="environment" onChange={handleDepositPhoto} className="hidden" />
              </label>
            </motion.div>
          )}

          {/* PAY SUMMARY */}
          {step === "summary" && payResult && (
            <motion.div key="summary" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="text-center mb-8">
                <CheckCircle size={48} className="text-primary mx-auto mb-4" />
                <h2 className="font-display italic text-3xl mb-2">Shift Complete</h2>
                <p className="text-muted-foreground text-sm">Great work tonight.</p>
              </div>

              <div className="glass-card rounded-xl p-6 space-y-4 mb-8">
                <div className="flex justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Commission ({payResult.commissionRate}/frame)</span>
                  <span className="font-mono text-sm">${payResult.commissionPay.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Hourly Floor</span>
                  <span className="font-mono text-sm">${payResult.hourlyPay.toFixed(2)}</span>
                </div>
                <div className="anamorphic-line w-full" />
                <div className="flex justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary font-bold">Final Pay ({payResult.payMethod})</span>
                  <span className="font-mono text-lg text-primary font-bold glow-text">${payResult.finalPay.toFixed(2)}</span>
                </div>
                {payResult.overageTip > 0 && (
                  <div className="flex justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Overage Tip</span>
                    <span className="font-mono text-sm text-green-400">+${payResult.overageTip.toFixed(2)}</span>
                  </div>
                )}
                {payResult.isBonusTier && (
                  <div className="flex items-center gap-2 mt-2">
                    <Star size={14} className="text-primary fill-primary" />
                    <span className="font-mono text-[10px] text-primary">Bonus tier achieved!</span>
                  </div>
                )}
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => { setStep("idle"); setActiveShift(null); setPayResult(null); }}
                className="w-full glass-card py-4 rounded-lg font-mono text-[11px] uppercase tracking-[0.2em] text-primary hover:bg-primary/10 transition-all"
              >
                Done
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PhotographerApp;
