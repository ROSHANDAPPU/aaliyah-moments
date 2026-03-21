import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Copy, Check } from "lucide-react";

const brandSpring = { type: "spring" as const, stiffness: 260, damping: 20 };

const generateCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "AALY-";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const TreasureBox = () => {
  const [isOpened, setIsOpened] = useState(false);
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);

  const handleOpen = () => {
    if (!isOpened) {
      setCode(generateCode());
      setIsOpened(true);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setIsOpened(false);
    setCode("");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="text-center mb-16"
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary mb-4">
          Your Unique Access
        </p>
        <h1 className="font-display italic text-4xl md:text-5xl tracking-[-0.04em] leading-[0.9]">
          The Treasure Box
        </h1>
      </motion.div>

      {/* The Box */}
      <div className="relative w-[280px] h-[280px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          {!isOpened ? (
            <motion.button
              key="box"
              onClick={handleOpen}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              className="w-full h-full glass-card rounded-2xl flex flex-col items-center justify-center gap-6 cursor-pointer group relative overflow-hidden"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Shimmer */}
              <div className="absolute inset-0 overflow-hidden rounded-2xl">
                <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
              </div>
              <Lock size={48} className="text-primary/60 group-hover:text-primary transition-colors duration-500" />
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground group-hover:text-foreground transition-colors">
                Tap to Reveal
              </span>
            </motion.button>
          ) : (
            <motion.div
              key="revealed"
              className="w-full h-full flex flex-col items-center justify-center gap-8"
            >
              {/* Top half */}
              <motion.div
                initial={{ y: 0 }}
                animate={{ y: -60, opacity: 0.3 }}
                transition={brandSpring}
                className="glass-card w-full h-[100px] rounded-t-2xl absolute top-0"
              />
              {/* Bottom half */}
              <motion.div
                initial={{ y: 0 }}
                animate={{ y: 60, opacity: 0.3 }}
                transition={brandSpring}
                className="glass-card w-full h-[100px] rounded-b-2xl absolute bottom-0"
              />

              {/* The Code */}
              <motion.div
                initial={{ letterSpacing: "1em", opacity: 0 }}
                animate={{ letterSpacing: "-0.02em", opacity: 1 }}
                transition={brandSpring}
                className="font-mono text-primary text-3xl md:text-4xl font-bold glow-text z-10"
              >
                {code}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex gap-3 z-10"
              >
                <button
                  onClick={handleCopy}
                  className="glass-card px-6 py-3 rounded-lg font-mono text-[10px] uppercase tracking-[0.2em] text-primary hover:bg-primary/10 transition-all flex items-center gap-2"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied" : "Copy Code"}
                </button>
                <button
                  onClick={handleReset}
                  className="glass-card px-6 py-3 rounded-lg font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-all"
                >
                  New Code
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-muted-foreground text-sm text-center max-w-sm mt-12 leading-relaxed"
      >
        Save this code — you'll need it to unlock your photo gallery after your event.
      </motion.p>
    </div>
  );
};

export default TreasureBox;
