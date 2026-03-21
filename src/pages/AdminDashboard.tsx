import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Activity, AlertTriangle, Package, DollarSign, Users, MapPin } from "lucide-react";

const AdminDashboard = () => {
  const { isAdmin, isManager } = useAuth();
  const [activeShifts, setActiveShifts] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [venues, setVenues] = useState<any[]>([]);
  const [tab, setTab] = useState<"live" | "tickets" | "inventory">("live");

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    const [shiftsRes, ticketsRes, venuesRes] = await Promise.all([
      supabase.from("shifts").select("*, venues(name), profiles!shifts_photographer_id_fkey(full_name)").eq("status", "active"),
      supabase.from("discrepancy_tickets").select("*, venues(name), profiles!discrepancy_tickets_photographer_id_fkey(full_name)").in("status", ["open", "investigating"]).order("created_at", { ascending: false }),
      supabase.from("venues").select("*").eq("is_active", true),
    ]);
    if (shiftsRes.data) setActiveShifts(shiftsRes.data);
    if (ticketsRes.data) setTickets(ticketsRes.data);
    if (venuesRes.data) setVenues(venuesRes.data);
  };

  const tabs = [
    { id: "live" as const, label: "Live Shifts", icon: Activity, count: activeShifts.length },
    { id: "tickets" as const, label: "Discrepancies", icon: AlertTriangle, count: tickets.length },
    { id: "inventory" as const, label: "Inventory", icon: Package },
  ];

  return (
    <div className="min-h-screen pt-24 pb-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary mb-4">Command Center</p>
          <h1 className="font-display italic text-3xl md:text-4xl tracking-[-0.04em] leading-[0.9]">
            Control <span className="text-gradient-primary">Room</span>
          </h1>
        </motion.div>

        {/* Alert Banners */}
        {tickets.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-lg p-4 mb-6 border-l-2 border-l-destructive">
            <div className="flex items-center gap-3">
              <AlertTriangle size={16} className="text-destructive" />
              <p className="font-mono text-xs text-destructive">{tickets.length} open discrepancy ticket{tickets.length > 1 ? "s" : ""}</p>
            </div>
          </motion.div>
        )}

        {venues.filter(v => v.frame_stock <= v.low_stock_threshold).length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="glass-card rounded-lg p-4 mb-6 border-l-2 border-l-amber-500">
            <div className="flex items-center gap-3">
              <Package size={16} className="text-amber-500" />
              <p className="font-mono text-xs text-amber-500">
                Low stock at: {venues.filter(v => v.frame_stock <= v.low_stock_threshold).map(v => v.name).join(", ")}
              </p>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`glass-card px-5 py-3 rounded-lg font-mono text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 whitespace-nowrap transition-all ${
                tab === t.id ? "text-primary border-primary/50 bg-primary/5" : "text-muted-foreground"
              }`}
            >
              <t.icon size={14} />
              {t.label}
              {t.count !== undefined && t.count > 0 && (
                <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-[9px]">{t.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Live Shifts */}
        {tab === "live" && (
          <div className="space-y-4">
            {activeShifts.length === 0 && (
              <div className="glass-card rounded-xl p-12 text-center">
                <Activity size={32} className="text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground text-sm">No active shifts right now.</p>
              </div>
            )}
            {activeShifts.map((shift: any) => (
              <motion.div
                key={shift.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-xl p-5"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-mono text-sm font-bold">{(shift as any).profiles?.full_name || "Unknown"}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin size={12} className="text-primary" />
                      <p className="font-mono text-[10px] text-primary">{(shift as any).venues?.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-xs text-muted-foreground">
                      Started {new Date(shift.start_time).toLocaleTimeString()}
                    </p>
                    <p className="font-mono text-sm text-primary mt-1">{shift.total_sales || 0} sales</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Discrepancy Tickets */}
        {tab === "tickets" && (
          <div className="space-y-4">
            {tickets.length === 0 && (
              <div className="glass-card rounded-xl p-12 text-center">
                <AlertTriangle size={32} className="text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground text-sm">No open tickets. All clear.</p>
              </div>
            )}
            {tickets.map((ticket: any) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-xl p-5 border-l-2 border-l-destructive"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-mono text-sm font-bold">{(ticket as any).venues?.name}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">{(ticket as any).profiles?.full_name}</p>
                  </div>
                  <span className={`font-mono text-[9px] uppercase px-2 py-1 rounded-full ${
                    ticket.status === "open" ? "bg-destructive/20 text-destructive" : "bg-amber-500/20 text-amber-500"
                  }`}>
                    {ticket.status}
                  </span>
                </div>
                {ticket.delta_summary && (
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(ticket.delta_summary as Record<string, number>).map(([key, val]) => (
                      <span key={key} className={`font-mono text-[10px] px-2 py-1 rounded ${
                        val !== 0 ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"
                      }`}>
                        {key}: {val > 0 ? "+" : ""}{val}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Inventory */}
        {tab === "inventory" && (
          <div className="grid md:grid-cols-2 gap-4">
            {venues.map((venue) => {
              const stockPercent = venue.low_stock_threshold > 0
                ? (venue.frame_stock / venue.low_stock_threshold) * 100
                : 100;
              const color = stockPercent <= 100 ? "destructive" : stockPercent <= 120 ? "amber-500" : "primary";

              return (
                <motion.div
                  key={venue.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card rounded-xl p-5"
                >
                  <div className="flex justify-between items-center mb-4">
                    <p className="font-mono text-sm font-bold">{venue.name}</p>
                    <span className={`w-2 h-2 rounded-full ${
                      venue.frame_stock <= venue.low_stock_threshold ? "bg-destructive" :
                      venue.frame_stock <= venue.low_stock_threshold * 1.2 ? "bg-amber-500" : "bg-green-500"
                    }`} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Frames</p>
                      <p className="font-mono text-lg">{venue.frame_stock}</p>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Paper</p>
                      <p className="font-mono text-lg">{venue.paper_stock}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
