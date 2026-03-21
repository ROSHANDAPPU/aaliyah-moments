import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import logo from "@/assets/logo.png";

const Auth = () => {
  const { user, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { signIn, signUp } = useAuth();

  if (loading) return null;
  if (user) return <Navigate to="/app" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const result = isLogin
      ? await signIn(email, password)
      : await signUp(email, password, fullName);
    if (result.error) setError(result.error.message);
    setSubmitting(false);
  };

  const inputClass = "w-full bg-transparent border-b border-muted focus:border-primary py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none transition-colors duration-500";

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-12">
          <img src={logo} alt="Aaliyah Illusions" className="h-12 mx-auto mb-6" />
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary">
            Operations Portal
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Full Name</label>
              <input type="text" required={!isLogin} value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} placeholder="Your name" />
            </div>
          )}
          <div>
            <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="you@aaliyah.com" />
          </div>
          <div>
            <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} placeholder="••••••••" />
          </div>

          {error && (
            <p className="text-destructive text-xs font-mono">{error}</p>
          )}

          <motion.button
            type="submit"
            disabled={submitting}
            whileTap={{ scale: 0.98 }}
            className="w-full glass-card py-4 rounded-lg font-mono text-[11px] uppercase tracking-[0.2em] text-primary hover:bg-primary/10 transition-all duration-500 pulse-glow disabled:opacity-50"
          >
            {submitting ? "Authenticating..." : isLogin ? "Enter" : "Create Account"}
          </motion.button>
        </form>

        <button
          onClick={() => { setIsLogin(!isLogin); setError(""); }}
          className="w-full mt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors text-center"
        >
          {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </motion.div>
    </div>
  );
};

export default Auth;
