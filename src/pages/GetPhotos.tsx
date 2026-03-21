import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Star } from "lucide-react";

const GetPhotos = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    code: "",
  });
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 2500);
  };

  const inputClass = (field: string) =>
    `w-full bg-transparent border-b ${
      focusedField === field || formData[field as keyof typeof formData]
        ? "border-primary"
        : "border-muted"
    } py-3 text-foreground placeholder:text-muted-foreground/50 font-mono text-sm focus:outline-none transition-colors duration-500`;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-20">
      <AnimatePresence mode="wait">
        {isSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            {/* Polaroid effect */}
            <motion.div
              initial={{ rotateZ: -5, y: 50, opacity: 0 }}
              animate={{ rotateZ: 0, y: 0, opacity: 1 }}
              transition={{ type: "spring", duration: 0.8, bounce: 0.3 }}
              className="glass-card w-[280px] h-[340px] rounded-sm p-4 pb-16 mx-auto mb-8 relative"
            >
              <div className="w-full h-full bg-primary/5 rounded-sm flex items-center justify-center">
                <Camera size={48} className="text-primary/40" />
              </div>
              <p className="absolute bottom-4 left-0 right-0 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
                Developing...
              </p>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="font-display italic text-2xl mb-3"
            >
              The vault is open.
            </motion.p>
            <p className="text-muted-foreground text-sm">
              Check your email for your gallery link.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-md"
          >
            <div className="mb-12">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary mb-4">
                Photo Retrieval
              </p>
              <h1 className="font-display italic text-4xl md:text-5xl tracking-[-0.04em] leading-[0.9]">
                Enter the vault.
              </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  onFocus={() => setFocusedField("name")}
                  onBlur={() => setFocusedField(null)}
                  className={inputClass("name")}
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  className={inputClass("email")}
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Phone <span className="text-muted-foreground/50">(optional)</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  onFocus={() => setFocusedField("phone")}
                  onBlur={() => setFocusedField(null)}
                  className={inputClass("phone")}
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div>
                <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Treasure Code
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  onFocus={() => setFocusedField("code")}
                  onBlur={() => setFocusedField(null)}
                  className={`${inputClass("code")} font-bold text-lg tracking-wider`}
                  placeholder="AALY-XXXX"
                  maxLength={9}
                />
              </div>

              {/* Star Rating */}
              <div>
                <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground block mb-3">
                  Rate your experience <span className="text-muted-foreground/50">(optional)</span>
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transition-all duration-300"
                    >
                      <Star
                        size={24}
                        className={`transition-all duration-300 ${
                          star <= (hoverRating || rating)
                            ? "text-primary fill-primary drop-shadow-[0_0_8px_#11BDE3]"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileTap={{ scale: 0.98 }}
                className="w-full glass-card py-4 rounded-lg font-mono text-[11px] uppercase tracking-[0.2em] text-primary hover:bg-primary/10 transition-all duration-500 pulse-glow disabled:opacity-50"
              >
                {isSubmitting ? "Developing..." : "Unlock Gallery"}
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GetPhotos;
