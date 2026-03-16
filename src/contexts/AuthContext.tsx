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
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
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
  userProfile: any | null;
  puntos: number;
}

const ADMIN_EMAILS = ["electrichousescooters@gmail.com"];

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  loginWithGoogle: async () => {},
  loginWithFacebook: async () => {},
  logout: async () => {},
  isAdmin: false,
  userProfile: null,
  puntos: 0,
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Cargar perfil de usuario desde Firestore
        const userDoc = await getDoc(doc(db, "usuarios", user.uid));
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
            ultimaCompra: null
          };
          await setDoc(doc(db, "usuarios", user.uid), nuevoUsuario);
          setUserProfile(nuevoUsuario);
          setPuntos(0);
        }
      } else {
        setUserProfile(null);
        setPuntos(0);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const register = async (email: string, password: string, nombre: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Crear perfil en Firestore
      await setDoc(doc(db, "usuarios", result.user.uid), {
        email,
        nombre,
        telefono: "",
        direcciones: [],
        fechaRegistro: new Date(),
        puntos: 0,
        puntosCanjeados: 0,
        metodoRegistro: "email",
        ultimaCompra: null
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
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      const authError = error as AuthError;
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
      
      // Verificar si ya existe perfil
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
          ultimaCompra: null
        });
      }
    } catch (error) {
      console.error("Error con Google:", error);
      throw new Error("No se pudo iniciar sesión con Google");
    }
  };

  const loginWithFacebook = async () => {
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      
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
          ultimaCompra: null
        });
      }
    } catch (error) {
      console.error("Error con Facebook:", error);
      throw new Error("No se pudo iniciar sesión con Facebook");
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const isAdmin = !!user && ADMIN_EMAILS.includes(user.email || "");

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
      userProfile,
      puntos
    }}>
      {children}
    </AuthContext.Provider>
  );
};