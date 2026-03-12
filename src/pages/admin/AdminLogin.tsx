import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const AdminLogin = () => {
  const { t } = useLanguage();
  const { user, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      toast({
        title: "Éxito",
        description: "Sesión iniciada correctamente",
      });
    } catch (err: any) {
      const errorMessage = err.code === 'auth/invalid-credential' 
        ? "Email o contraseña incorrectos"
        : err.message || "Error de autenticación";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock size={20} className="text-primary" />
          </div>
          <h1 className="font-display font-bold text-2xl tracking-tight text-foreground">
            {t("admin.login")}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("admin.email")}
            className="w-full bg-secondary border border-border rounded px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
            required
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("admin.password")}
              className="w-full bg-secondary border border-border rounded px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground font-display font-bold tracking-widest text-sm py-3 rounded transition-all duration-300 hover:bg-glow disabled:opacity-50"
          >
            {loading ? "Cargando..." : t("admin.enter")}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminLogin;