import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Navigate } from "react-router-dom";
import { getAuth, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, Lock } from "lucide-react";

const AdminChangePassword = () => {
  const { user, isAdmin } = useAuth();
  const { t } = useLanguage();
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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
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

      // Reautenticar al usuario antes de cambiar la contraseña
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Cambiar la contraseña
      await updatePassword(user, newPassword);

      toast({
        title: "Éxito",
        description: "Contraseña cambiada correctamente",
      });

      // Limpiar el formulario
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Error cambiando contraseña:", error);
      
      let errorMessage = "Error al cambiar la contraseña";
      if (error.code === 'auth/wrong-password') {
        errorMessage = "La contraseña actual es incorrecta";
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = "Por favor, inicia sesión nuevamente";
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-md mx-auto px-4 lg:px-8">
        <div className="bg-gray-900 rounded-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock size={24} className="text-primary" />
            </div>
            <h1 className="font-display font-bold text-2xl text-white">
              Cambiar Contraseña
            </h1>
            <p className="text-gray-400 text-sm mt-2">
              {user?.email}
            </p>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-6">
            {/* Contraseña actual */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Contraseña actual
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:border-primary transition-colors pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary"
                >
                  {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Nueva contraseña */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Nueva contraseña
              </label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:border-primary transition-colors pr-12"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary"
                >
                  {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Mínimo 6 caracteres
              </p>
            </div>

            {/* Confirmar nueva contraseña */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Confirmar nueva contraseña
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:border-primary transition-colors pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-glow transition-colors disabled:opacity-50"
            >
              {loading ? "Cambiando contraseña..." : "Cambiar contraseña"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminChangePassword;