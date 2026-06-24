import React, { createContext, useContext, useEffect, useState } from "react";
import {
  auth,
  googleProvider,
  facebookProvider
} from "@/firebase/config";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  User,
  AuthError
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/firebase/config";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, nombre: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  userProfile: any | null;
  puntos: number;
  adminLevel: 'super' | 'admin' | 'none';
  registerAdminLog: (action: string, details: any) => Promise<void>;
}

// NIVEL 1: Super Admins (pueden crear otros admins)
const SUPER_ADMIN_EMAILS = ["electrichousescooters@gmail.com"];

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  loginWithGoogle: async () => {},
  loginWithFacebook: async () => {},
  logout: async () => {},
  isAdmin: false,
  isSuperAdmin: false,
  userProfile: null,
  puntos: 0,
  adminLevel: 'none',
  registerAdminLog: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {    
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [puntos, setPuntos] = useState(0);
  const [adminLevel, setAdminLevel] = useState<'super' | 'admin' | 'none'>('none');

  const checkAdminStatus = async (uid: string, email: string) => {
    try {
      if (SUPER_ADMIN_EMAILS.includes(email)) {
        setAdminLevel('super');
        return true;
      }

      const adminDoc = await getDoc(doc(db, "admins", uid));
      if (adminDoc.exists() && adminDoc.data().active === true) {
        setAdminLevel('admin');
        return true;
      }

      setAdminLevel('none');
      return false;
    } catch (error) {
      console.error("Error verificando admin:", error);
      setAdminLevel('none');
      return false;
    }
  };

  const registerAdminLog = async (action: string, details: any) => {
    if (!user) return;
    
    try {
      const logRef = collection(db, "admin_logs");
      await setDoc(doc(logRef), {
        uid: user.uid,
        email: user.email,
        action,
        details,
        timestamp: new Date(),
        ip: window.location.hostname,
        userAgent: navigator.userAgent
      });
    } catch (error) {
      console.error("Error registrando log:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const userDoc = await getDoc(doc(db, "usuarios", user.uid));
        await checkAdminStatus(user.uid, user.email || "");
        
        if (userDoc.exists()) {
          setUserProfile(userDoc.data());
          setPuntos(userDoc.data().puntos || 0);
        } else {
          const nuevoUsuario = {
            email: user.email,
            nombre: user.displayName || "",
            telefono: "",
            direcciones: [],
            fechaRegistro: new Date(),
            puntos: 0,
            puntosCanjeados: 0,
            metodoRegistro: user.providerData[0]?.providerId || "email",
            ultimaCompra: null,
            esAdmin: false
          };
          await setDoc(doc(db, "usuarios", user.uid), nuevoUsuario);
          setUserProfile(nuevoUsuario);
          setPuntos(0);
        }
      } else {
        setUserProfile(null);
        setPuntos(0);
        setAdminLevel('none');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const register = async (email: string, password: string, nombre: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, "usuarios", result.user.uid), {
        email,
        nombre,
        telefono: "",
        direcciones: [],
        fechaRegistro: new Date(),
        puntos: 0,
        puntosCanjeados: 0,
        metodoRegistro: "email",
        ultimaCompra: null,
        esAdmin: false
      });
    } catch (error) {
      const authError = error as AuthError;
      if (authError.code === 'auth/email-already-in-use') {
        throw new Error("Este email ya está registrado");
      } else if (authError.code === 'auth/weak-password') {
        throw new Error("La contraseña debe tener al menos 6 caracteres");
      } else {
        throw new Error(authError.message);
      }
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await registerAdminLog('LOGIN_INTENTO', { email, success: true });
    } catch (error) {
      const authError = error as AuthError;
      await registerAdminLog('LOGIN_FALLIDO', { email, error: authError.code });
      
      if (authError.code === 'auth/invalid-credential') {
        throw new Error("Email o contraseña incorrectos");
      } else {
        throw new Error(authError.message);
      }
    }
  };

  // GOOGLE LOGIN - CORREGIDO CON MEJOR MANEJO DE ERRORES
  const loginWithGoogle = async () => {
    try {
      console.log("🔄 Iniciando login con Google...");
      
      // Configurar proveedor con parámetros adicionales
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const result = await signInWithPopup(auth, googleProvider);
      console.log("✅ Login con Google exitoso:", result.user.email);
      
      await registerAdminLog('LOGIN_GOOGLE', { email: result.user.email, success: true });

      const userDoc = await getDoc(doc(db, "usuarios", result.user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, "usuarios", result.user.uid), {
          email: result.user.email,
          nombre: result.user.displayName || "Usuario Google",
          telefono: "",
          direcciones: [],
          fechaRegistro: new Date(),
          puntos: 0,
          puntosCanjeados: 0,
          metodoRegistro: "google",
          ultimaCompra: null,
          esAdmin: false
        });
      }
      
      return result;
    } catch (error: any) {
      console.error("❌ Error con Google:", error);
      
      let errorMessage = "No se pudo iniciar sesión con Google";
      
      if (error.code === 'auth/popup-blocked') {
        errorMessage = "El navegador bloqueó la ventana emergente. Permite las ventanas emergentes para este sitio.";
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = "Cerraste la ventana de inicio de sesión. Intenta de nuevo.";
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMessage = "Este dominio no está autorizado para usar Google. Contacta al administrador.";
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = "Error de red. Verifica tu conexión a internet.";
      }
      
      await registerAdminLog('LOGIN_GOOGLE_ERROR', { error: error.code, message: errorMessage });
      throw new Error(errorMessage);
    }
  };

  // FACEBOOK LOGIN - CORREGIDO CON MEJOR MANEJO DE ERRORES
  const loginWithFacebook = async () => {
    try {
      console.log("🔄 Iniciando login con Facebook...");
      
      // Configurar proveedor con parámetros adicionales
      facebookProvider.setCustomParameters({
        display: 'popup'
      });
      
      const result = await signInWithPopup(auth, facebookProvider);
      console.log("✅ Login con Facebook exitoso:", result.user.email);
      
      await registerAdminLog('LOGIN_FACEBOOK', { email: result.user.email, success: true });

      const userDoc = await getDoc(doc(db, "usuarios", result.user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, "usuarios", result.user.uid), {
          email: result.user.email,
          nombre: result.user.displayName || "Usuario Facebook",
          telefono: "",
          direcciones: [],
          fechaRegistro: new Date(),
          puntos: 0,
          puntosCanjeados: 0,
          metodoRegistro: "facebook",
          ultimaCompra: null,
          esAdmin: false
        });
      }
      
      return result;
    } catch (error: any) {
      console.error("❌ Error con Facebook:", error);
      
      let errorMessage = "No se pudo iniciar sesión con Facebook";
      
      if (error.code === 'auth/popup-blocked') {
        errorMessage = "El navegador bloqueó la ventana emergente. Permite las ventanas emergentes para este sitio.";
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = "Cerraste la ventana de inicio de sesión. Intenta de nuevo.";
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMessage = "Este dominio no está autorizado para usar Facebook. Contacta al administrador.";
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = "Error de red. Verifica tu conexión a internet.";
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        errorMessage = "Ya existe una cuenta con este email usando otro método de inicio de sesión.";
      }
      
      await registerAdminLog('LOGIN_FACEBOOK_ERROR', { error: error.code, message: errorMessage });
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      if (user) {
        await registerAdminLog('LOGOUT', { email: user.email });
      }
      await signOut(auth);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const isAdmin = adminLevel !== 'none';
  const isSuperAdmin = adminLevel === 'super';

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      loginWithGoogle,
      loginWithFacebook,
      logout,
      isAdmin,
      isSuperAdmin,
      userProfile,
      puntos,
      adminLevel,
      registerAdminLog
    }}>
      {children}
    </AuthContext.Provider>
  );
};