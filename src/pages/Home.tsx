import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Camera, Star, Instagram } from "lucide-react";
import logo from "@/assets/logo.png";

const brandSpring = { type: "spring" as const, duration: 0.6, bounce: 0.2 };

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-6">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute top-0 left-0 right-0 h-px anamorphic-line" />
        <div className="absolute bottom-0 left-0 right-0 h-px anamorphic-line" />
      </div>

      {/* Logo */}
      <motion.div
        initial={{ filter: "blur(20px)", opacity: 0 }}
        animate={{ filter: "blur(0px)", opacity: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8"
      >
        <img src={logo} alt="Aaliyah Illusions" className="h-16 md:h-24 w-auto" />
      </motion.div>

      {/* Tagline */}
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, ...brandSpring }}
        className="font-display italic text-4xl md:text-6xl lg:text-7xl tracking-[-0.04em] leading-[0.9] text-center mb-6"
      >
        Your moments,{" "}
        <span className="text-gradient-primary">developed in light.</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-muted-foreground text-center max-w-md mb-12 leading-relaxed"
      >
        Premium cinematic photography. Every frame lives beyond the moment.
      </motion.p>

      {/* CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, ...brandSpring }}
        className="flex flex-col sm:flex-row gap-4 items-center"
      >
        <Link
          to="/get-photos"
          className="glass-card px-8 py-4 rounded-lg font-mono text-[11px] uppercase tracking-[0.2em] text-primary hover:bg-primary/10 transition-all duration-500 pulse-glow flex items-center gap-3"
        >
          <Camera size={16} />
          Unlock Your Gallery
        </Link>
        <Link
          to="/reviews"
          className="glass-card px-8 py-4 rounded-lg font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all duration-500 flex items-center gap-3"
        >
          <Star size={16} />
          Leave a Review
        </Link>
        <a
          href="https://instagram.com/aaliyahillusions"
          target="_blank"
          rel="noopener noreferrer"
          className="glass-card px-8 py-4 rounded-lg font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all duration-500 flex items-center gap-3"
        >
          <Instagram size={16} />
          Instagram
        </a>
      </motion.div>

      {/* Bottom anamorphic flare */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ delay: 1.2, duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        className="absolute bottom-[15vh] left-1/4 right-1/4 h-px anamorphic-line"
      />
    </div>
  );
};

export default Home;
