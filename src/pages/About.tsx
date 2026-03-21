import { motion } from "framer-motion";
import { Instagram, Quote } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <div className="container mx-auto max-w-4xl">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Portrait / Visual */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div className="glass-card rounded-2xl aspect-[3/4] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
              <div className="text-center z-10 p-8">
                <p className="font-display italic text-6xl md:text-7xl text-foreground/10 leading-none mb-4">
                  R
                </p>
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary">
                  Roshan Dappu
                </p>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-1">
                  Founder & Creative Director
                </p>
              </div>
            </div>

            {/* Overlapping quote */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="glass-card rounded-xl p-6 -mt-12 mx-8 relative z-10"
            >
              <Quote size={16} className="text-primary mb-2" />
              <p className="font-display italic text-lg leading-relaxed">
                "Every frame is a conversation between light and memory."
              </p>
            </motion.div>
          </motion.div>

          {/* Story */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary mb-4">
              The Story
            </p>
            <h1 className="font-display italic text-4xl md:text-5xl tracking-[-0.04em] leading-[0.9] mb-8">
              Built on trust.{" "}
              <span className="text-gradient-primary">Framed with purpose.</span>
            </h1>

            <div className="space-y-6 text-muted-foreground leading-relaxed text-sm">
              <p>
                Aaliyah Illusions was born from a simple belief: every moment deserves 
                to be remembered in its most honest, most beautiful form. Founded by 
                Roshan Dappu, this isn't just a photography brand — it's a commitment 
                to turning fleeting seconds into timeless art.
              </p>
              <p>
                From intimate weddings to electrifying nightlife events, from brand 
                campaigns to personal milestones — we approach every frame with the 
                same reverence. Because your story is worth telling right.
              </p>
              <p>
                Our mission is simple: connect moments to people. Through cinematic 
                imagery, secure delivery, and an experience that feels as premium as 
                the memories we capture.
              </p>
            </div>

            <div className="mt-8 space-y-4">
              <div className="anamorphic-line w-full" />
              
              <div className="flex flex-wrap gap-6">
                <div>
                  <p className="font-display italic text-3xl text-primary">500+</p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Events Captured</p>
                </div>
                <div>
                  <p className="font-display italic text-3xl text-primary">50K+</p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Photos Delivered</p>
                </div>
                <div>
                  <p className="font-display italic text-3xl text-primary">100%</p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Heart & Soul</p>
                </div>
              </div>

              <div className="anamorphic-line w-full" />
            </div>

            <motion.a
              href="https://instagram.com/aaliyahillusions"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02 }}
              className="glass-card inline-flex items-center gap-3 px-8 py-4 rounded-lg font-mono text-[11px] uppercase tracking-[0.2em] text-primary hover:bg-primary/10 transition-all duration-500 mt-8"
            >
              <Instagram size={16} />
              Follow the Journey
            </motion.a>

            {/* Signature */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-12"
            >
              <p className="font-display italic text-2xl text-primary/40">
                Aaliyah Illusions
              </p>
              <p className="font-mono text-[10px] text-muted-foreground/50 mt-1">
                Where memories become stories.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default About;
