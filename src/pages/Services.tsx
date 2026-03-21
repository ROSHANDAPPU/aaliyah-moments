import { motion } from "framer-motion";
import { Heart, Building2, PartyPopper, Cake, GraduationCap, Home, Music, Film } from "lucide-react";

const services = [
  { icon: Heart, title: "Weddings", desc: "Timeless love stories captured in cinematic frames" },
  { icon: Building2, title: "Brands", desc: "Visual identity that commands attention" },
  { icon: PartyPopper, title: "Events", desc: "Every celebration deserves its spotlight" },
  { icon: Cake, title: "Birthdays", desc: "Joy frozen in perfect light" },
  { icon: GraduationCap, title: "Graduation", desc: "Milestones framed for eternity" },
  { icon: Home, title: "Real Estate", desc: "Spaces transformed through the lens" },
  { icon: Music, title: "Music Videos", desc: "Sound meets vision in motion" },
  { icon: Film, title: "Cinematography", desc: "Moving pictures that move people" },
];

const Services = () => {
  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary mb-4">
            What We Create
          </p>
          <h1 className="font-display italic text-4xl md:text-5xl tracking-[-0.04em] leading-[0.9]">
            Eight disciplines,{" "}
            <span className="text-gradient-primary">one vision.</span>
          </h1>
        </motion.div>

        {/* Horizontal scroll on mobile, grid on desktop */}
        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-4 -mx-6 px-6 md:mx-0 md:px-0">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="glass-card rounded-xl p-6 min-w-[260px] md:min-w-0 snap-center aspect-[2/3] flex flex-col justify-between group cursor-pointer hover:scale-[1.02] transition-transform duration-500"
            >
              <div>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors duration-500">
                  <service.icon size={22} className="text-primary" />
                </div>
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary/60 mb-2 writing-mode-vertical md:writing-mode-horizontal" style={{ writingMode: "vertical-rl" as never }}>
                  {service.title}
                </p>
              </div>
              <div>
                <h3 className="font-display italic text-2xl mb-2 group-hover:text-primary transition-colors duration-500">
                  {service.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {service.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;
