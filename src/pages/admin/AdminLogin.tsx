import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Shield, Mail, Lock, LogIn, AlertTriangle } from "lucide-react";

const AdminLogin = () => {
  const { login, isAdmin, user, registerAdminLog } = useAuth();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [intentos, setIntentos] = useState(0);
  const [bloqueado, setBloqueado] = useState(false);

  // Si ya está autenticado y es admin, redirigir
  useEffect(() => {
    if (user && isAdmin) {
      navigate("/admin/dashboard");
    }
  }, [user, isAdmin, navigate]);

  // Bloquear después de 5 intentos fallidos
  useEffect(() => {
    if (intentos >= 5) {
      setBloqueado(true);
      setTimeout(() => {
        setBloqueado(false);
        setIntentos(0);
      }, 300000); // 5 minutos
    }
  }, [intentos]);

  const getText = (es: string, en: string, gr: string) => {
    if (lang === 'en') return en;
    if (lang === 'gr') return gr;
    return es;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (bloqueado) {
      setError("Demasiados intentos. Espera 5 minutos.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await login(email, password);
      
      // Registrar intento exitoso
      await registerAdminLog('LOGIN_ADMIN_EXITOSO', { email });
      setIntentos(0);
      
      // Redirigir al dashboard o a la página que intentaba acceder
      const from = (location.state as any)?.from?.pathname || "/admin/dashboard";
      navigate(from);
      
    } catch (error: any) {
      setIntentos(prev => prev + 1);
      console.error("Error de login:", error);
      
      setError(
        intentos >= 4 
          ? "Último intento antes de bloqueo" 
          : "Credenciales incorrectas"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-green-500/10 rounded-2xl border border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.2)] mb-4">
            <Shield size={48} className="text-green-500" />
          </div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">
            {getText("Admin Pro", "Admin Pro", "Διαχειριστής Pro")}
          </h1>
          <p className="text-gray-500">
            {getText(
              "Acceso restringido - Solo administradores",
              "Restricted access - Administrators only",
              "Περιορισμένη πρόσβαση - Μόνο διαχειριστές"
            )}
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-[#0a0a0a] rounded-2xl border border-green-900/30 p-8 shadow-[0_0_30px_rgba(0,0,0,0.5)] hover:shadow-[0_0_40px_rgba(34,197,94,0.2)] transition-all">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                {getText("Email", "Email", "Email")}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/50 border border-green-900/30 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-gray-600 outline-none focus:border-green-500/50 transition-all"
                  placeholder="admin@electric-scooter.com"
                  required
                  disabled={bloqueado}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                {getText("Contraseña", "Password", "Κωδικός")}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/50 border border-green-900/30 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-gray-600 outline-none focus:border-green-500/50 transition-all"
                  placeholder="••••••••"
                  required
                  disabled={bloqueado}
                />
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-500" />
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            )}

            {/* Intento counter */}
            {intentos > 0 && !bloqueado && (
              <p className="text-xs text-yellow-500 text-center">
                Intento {intentos} de 5
              </p>
            )}

            {/* Botón de login */}
            <button
              type="submit"
              disabled={loading || bloqueado}
              className="w-full bg-green-500/20 text-green-500 font-bold py-3 rounded-xl hover:bg-green-500/30 transition-all border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.1)] hover:shadow-[0_0_25px_rgba(34,197,94,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <LogIn size={18} />
              {loading
                ? getText("Verificando...", "Verifying...", "Επαλήθευση...")
                : bloqueado
                ? getText("Bloqueado", "Blocked", "Αποκλεισμένος")
                : getText("Acceder al Panel", "Access Panel", "Πρόσβαση Πίνακα")}
            </button>
          </form>

          {/* Información adicional */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-600">
              {getText(
                "Área restringida. Todos los intentos son registrados.",
                "Restricted area. All attempts are logged.",
                "Περιορισμένη περιοχή. Όλες οι απόπειρες καταγράφονται."
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;