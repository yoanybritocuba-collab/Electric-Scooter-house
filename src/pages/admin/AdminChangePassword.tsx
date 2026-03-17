import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Navigate } from "react-router-dom";
import { getAuth, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import AdminNavBack from "@/components/AdminNavBack";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, Lock, AlertCircle } from "lucide-react";

const AdminChangePassword = () => {
  const { user, isAdmin } = useAuth();
  const { t, lang } = useLanguage();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!user || !isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const getText = (es: string, en: string, gr: string) => {
    if (lang === 'en') return en;
    if (lang === 'gr') return gr;
    return es;
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast({
        title: getText("Error", "Error", "Σφάλμα"),
        description: getText(
          "La contraseña debe tener al menos 6 caracteres",
          "Password must be at least 6 characters",
          "Ο κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες"
        ),
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: getText("Error", "Error", "Σφάλμα"),
        description: getText(
          "Las contraseñas no coinciden",
          "Passwords do not match",
          "Οι κωδικοί δεν ταιριάζουν"
        ),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user || !user.email) {
        throw new Error("Usuario no encontrado");
      }

      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      toast({
        title: getText("Éxito", "Success", "Επιτυχία"),
        description: getText(
          "Contraseña cambiada correctamente",
          "Password changed successfully",
          "Ο κωδικός άλλαξε επιτυχώς"
        ),
        className: "bg-green-500 text-white",
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Error cambiando contraseña:", error);

      let errorMessage = getText(
        "Error al cambiar la contraseña",
        "Error changing password",
        "Σφάλμα αλλαγής κωδικού"
      );
      
      if (error.code === 'auth/wrong-password') {
        errorMessage = getText(
          "La contraseña actual es incorrecta",
          "Current password is incorrect",
          "Ο τρέχων κωδικός είναι λανθασμένος"
        );
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = getText(
          "Por favor, inicia sesión nuevamente",
          "Please log in again",
          "Παρακαλώ συνδεθείτε ξανά"
        );
      }

      toast({
        title: getText("Error", "Error", "Σφάλμα"),
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header con navegación */}
        <div className="mb-8">
          <AdminNavBack 
            title={getText('Cambiar Contraseña', 'Change Password', 'Αλλαγή Κωδικού')}
            description={getText('Actualiza tu clave de acceso', 'Update your password', 'Ενημέρωση κωδικού πρόσβασης')}
          />
        </div>

        <div className="bg-[#0a0a0a] rounded-2xl p-8 border border-green-900/30 shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:shadow-[0_0_25px_rgba(34,197,94,0.2)] transition-all">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-500/10 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
              <Lock size={24} className="text-green-500" />
            </div>
            <h1 className="font-display font-bold text-2xl text-white">
              {getText('Cambiar Contraseña', 'Change Password', 'Αλλαγή Κωδικού')}
            </h1>
            <p className="text-gray-500 text-sm mt-2">
              {user?.email}
            </p>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-6">
            {/* Contraseña actual */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                {getText('Contraseña actual', 'Current password', 'Τρέχων κωδικός')}
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-black/50 border border-green-900/30 rounded-xl px-4 py-3 text-white outline-none focus:border-green-500/50 transition-all pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-green-500"
                >
                  {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Nueva contraseña */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                {getText('Nueva contraseña', 'New password', 'Νέος κωδικός')}
              </label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-black/50 border border-green-900/30 rounded-xl px-4 py-3 text-white outline-none focus:border-green-500/50 transition-all pr-12"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-green-500"
                >
                  {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {getText('Mínimo 6 caracteres', 'Minimum 6 characters', 'Τουλάχιστον 6 χαρακτήρες')}
              </p>
            </div>

            {/* Confirmar nueva contraseña */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                {getText('Confirmar nueva contraseña', 'Confirm new password', 'Επιβεβαίωση νέου κωδικού')}
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-black/50 border border-green-900/30 rounded-xl px-4 py-3 text-white outline-none focus:border-green-500/50 transition-all pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-green-500"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500/20 text-green-500 font-bold py-3 rounded-xl hover:bg-green-500/30 transition-all border border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.1)] hover:shadow-[0_0_15px_rgba(34,197,94,0.3)] disabled:opacity-50"
            >
              {loading 
                ? getText('Cambiando...', 'Changing...', 'Αλλαγή...') 
                : getText('Cambiar contraseña', 'Change password', 'Αλλαγή κωδικού')}
            </button>
          </form>

          <div className="mt-6 p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
            <div className="flex items-center gap-2 text-yellow-500">
              <AlertCircle size={16} />
              <span className="text-sm">
                {getText(
                  'Por seguridad, después de cambiar la contraseña se cerrará tu sesión',
                  'For security, after changing your password you will be logged out',
                  'Για ασφάλεια, μετά την αλλαγή κωδικού θα αποσυνδεθείτε'
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminChangePassword;