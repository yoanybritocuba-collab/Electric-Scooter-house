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

// NIVEL 2: Admins normales (se almacenan en Firestore)
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

  // Función para verificar si un usuario es admin desde Firestore
  const checkAdminStatus = async (uid: string, email: string) => {
    try {
      // NIVEL 1: Super Admin (por email)
      if (SUPER_ADMIN_EMAILS.includes(email)) {
        setAdminLevel('super');
        return true;
      }

      // NIVEL 2: Admin normal (desde Firestore)
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

  // Función para registrar logs de admin
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
        // Cargar perfil de usuario desde Firestore
        const userDoc = await getDoc(doc(db, "usuarios", user.uid));
        
        // Verificar si es admin
        await checkAdminStatus(user.uid, user.email || "");
        
        if (userDoc.exists()) {
          setUserProfile(userDoc.data());
          setPuntos(userDoc.data().puntos || 0);
        } else {
          // Crear perfil si no existe
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
      } else {
        throw new Error(authError.message);
      }
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Registrar intento de login
      await registerAdminLog('LOGIN_INTENTO', { email, success: true });
      
    } catch (error) {
      const authError = error as AuthError;
      
      // Registrar intento fallido
      await registerAdminLog('LOGIN_FALLIDO', { email, error: authError.code });
      
      if (authError.code === 'auth/invalid-credential') {
        throw new Error("Email o contraseña incorrectos");
      } else {
        throw new Error(authError.message);
      }
    }
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
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
    } catch (error) {
      console.error("Error con Google:", error);
      await registerAdminLog('LOGIN_GOOGLE_ERROR', { error });
      throw new Error("No se pudo iniciar sesión con Google");
    }
  };

  const loginWithFacebook = async () => {
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      
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
    } catch (error) {
      console.error("Error con Facebook:", error);
      await registerAdminLog('LOGIN_FACEBOOK_ERROR', { error });
      throw new Error("No se pudo iniciar sesión con Facebook");
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

  // Función para que super admins puedan agregar nuevos admins
  const addAdmin = async (uid: string, email: string, nivel: 'admin' | 'super' = 'admin') => {
    if (adminLevel !== 'super') {
      throw new Error("No tienes permisos para agregar administradores");
    }
    
    await setDoc(doc(db, "admins", uid), {
      email,
      nivel,
      active: true,
      createdBy: user?.uid,
      createdAt: new Date()
    });
    
    await registerAdminLog('ADMIN_ADDED', { newAdminEmail: email, nivel });
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