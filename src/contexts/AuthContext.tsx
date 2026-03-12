import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/firebase/config";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut, 
  User,
  AuthError 
} from "firebase/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const ADMIN_EMAIL = "electrichousescooters@gmail.com";

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  isAdmin: false,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      const authError = error as AuthError;
      // Mensajes de error más amigables
      if (authError.code === 'auth/invalid-credential') {
        throw new Error("Email o contraseña incorrectos");
      } else if (authError.code === 'auth/too-many-requests') {
        throw new Error("Demasiados intentos. Intenta más tarde");
      } else {
        throw new Error(authError.message);
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      throw new Error("No se pudo cerrar la sesión");
    }
  };

  const isAdmin = !!user && user.email === ADMIN_EMAIL;

  const value = {
    user,
    loading,
    login,
    logout,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};