import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogIn, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo.png";

const publicNav = [
  { path: "/", label: "Home" },
  { path: "/services", label: "Services" },
  { path: "/treasure-box", label: "Treasure Box" },
  { path: "/get-photos", label: "Get Photos" },
  { path: "/reviews", label: "Reviews" },
  { path: "/about", label: "About" },
];

const opsNav = [
  { path: "/app", label: "Shift" },
  { path: "/admin", label: "Admin" },
];

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, signOut, isAdmin, isManager } = useAuth();

  const navItems = [
    ...publicNav,
    ...(user ? [{ path: "/app", label: "Shift" }] : []),
    ...(user && (isAdmin || isManager) ? [{ path: "/admin", label: "Admin" }] : []),
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="glass-card border-t-0 border-x-0">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="Aaliyah Illusions" className="h-8 w-auto" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`font-mono text-[11px] uppercase tracking-[0.2em] transition-all duration-500 hover:text-primary ${
                  location.pathname === item.path
                    ? "text-primary glow-text"
                    : "text-muted-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
            {!user ? (
              <Link to="/auth" className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary flex items-center gap-1">
                <LogIn size={14} /> Login
              </Link>
            ) : (
              <button onClick={signOut} className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-primary flex items-center gap-1">
                <LogOut size={14} /> Logout
              </button>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-foreground hover:text-primary transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden glass-card border-t-0 mx-4 mt-1 rounded-lg overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-4">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`font-mono text-[11px] uppercase tracking-[0.2em] block py-2 transition-colors ${
                      location.pathname === item.path
                        ? "text-primary"
                        : "text-muted-foreground hover:text-primary"
                    }`}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              {!user ? (
                <Link to="/auth" onClick={() => setIsOpen(false)} className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary py-2 flex items-center gap-2">
                  <LogIn size={14} /> Login
                </Link>
              ) : (
                <button onClick={() => { signOut(); setIsOpen(false); }} className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-primary py-2 text-left flex items-center gap-2">
                  <LogOut size={14} /> Logout
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navigation;
