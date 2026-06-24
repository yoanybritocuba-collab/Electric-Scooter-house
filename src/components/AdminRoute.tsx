import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin, loading, registerAdminLog } = useAuth();
  const location = useLocation();
  const [verifying, setVerifying] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      if (!loading) {
        if (!user || !isAdmin) {
          setAccessDenied(true);
          // Registrar intento de acceso no autorizado
          await registerAdminLog('ACCESO_DENEGADO', { 
            path: location.pathname,
            userEmail: user?.email || 'no-auth'
          });
        }
        setVerifying(false);
      }
    };
    
    checkAccess();
  }, [user, isAdmin, loading, location, registerAdminLog]);

  if (loading || verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4 shadow-[0_0_20px_rgba(34,197,94,0.3)]"></div>
          <p className="text-gray-400">Verificando credenciales de seguridad...</p>
        </div>
      </div>
    );
  }

  if (accessDenied || !user || !isAdmin) {
    return <Navigate to="/admin" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};