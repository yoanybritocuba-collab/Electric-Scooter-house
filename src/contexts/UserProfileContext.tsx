import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';

export interface Direccion {
  id: string;
  nombre: string;
  apellidos: string;
  direccion: string;
  ciudad: string;
  codigoPostal: string;
  provincia: string;
  pais: string;
  telefono: string;
  principal: boolean;
}

export interface MetodoPago {
  id: string;
  tipo: 'tarjeta' | 'paypal' | 'transferencia';
  titular: string;
  numero?: string;
  expiracion?: string;
  marca?: 'visa' | 'mastercard' | 'amex' | 'paypal';
  principal: boolean;
}

export interface Pedido {
  id: string;
  fecha: Date;
  total: number;
  estado: 'pendiente' | 'procesando' | 'enviado' | 'entregado' | 'cancelado';
  productos: Array<{
    id: string;
    nombre: string;
    precio: number;
    cantidad: number;
    imagen: string;
  }>;
  direccionEnvio: Direccion;
  metodoPago: MetodoPago;
  facturaUrl?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  nombre: string;
  apellidos: string;
  telefono: string;
  fechaNacimiento?: Date;
  avatar?: string;
  direcciones: Direccion[];
  metodosPago: MetodoPago[];
  pedidos: Pedido[];
  newsletter: boolean;
  fechaRegistro: Date;
}

interface UserProfileContextType {
  profile: UserProfile | null;
  loading: boolean;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  direcciones: Direccion[];
  metodosPago: MetodoPago[];
  pedidos: Pedido[];
  addDireccion: (direccion: Omit<Direccion, 'id'>) => Promise<void>;
  updateDireccion: (id: string, direccion: Partial<Direccion>) => Promise<void>;
  deleteDireccion: (id: string) => Promise<void>;
  setDireccionPrincipal: (id: string) => Promise<void>;
  addMetodoPago: (metodo: Omit<MetodoPago, 'id'>) => Promise<void>;
  deleteMetodoPago: (id: string) => Promise<void>;
  setMetodoPagoPrincipal: (id: string) => Promise<void>;
  getPedidos: () => Promise<Pedido[]>;
  getFactura: (pedidoId: string) => Promise<string | null>;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error('useUserProfile debe usarse dentro de UserProfileProvider');
  }
  return context;
};

export const UserProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const docRef = doc(db, 'usuarios', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
      } else {
        const newProfile: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          nombre: '',
          apellidos: '',
          telefono: '',
          direcciones: [],
          metodosPago: [],
          pedidos: [],
          newsletter: false,
          fechaRegistro: new Date(),
        };
        await setDoc(docRef, newProfile);
        setProfile(newProfile);
      }
    } catch (error) {
      console.error('Error cargando perfil:', error);
    }
    setLoading(false);
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user || !profile) return;
    
    try {
      const docRef = doc(db, 'usuarios', user.uid);
      const updatedProfile = { ...profile, ...data };
      await setDoc(docRef, updatedProfile);
      setProfile(updatedProfile);
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      throw error;
    }
  };

  const addDireccion = async (direccion: Omit<Direccion, 'id'>) => {
    if (!user || !profile) return;
    
    const newDireccion: Direccion = {
      ...direccion,
      id: Date.now().toString(),
      principal: profile.direcciones.length === 0 ? true : direccion.principal || false,
    };
    
    const updatedDirecciones = [...profile.direcciones, newDireccion];
    await updateProfile({ direcciones: updatedDirecciones });
  };

  const updateDireccion = async (id: string, direccion: Partial<Direccion>) => {
    if (!user || !profile) return;
    
    const updatedDirecciones = profile.direcciones.map(d => 
      d.id === id ? { ...d, ...direccion } : d
    );
    await updateProfile({ direcciones: updatedDirecciones });
  };

  const deleteDireccion = async (id: string) => {
    if (!user || !profile) return;
    
    const updatedDirecciones = profile.direcciones.filter(d => d.id !== id);
    await updateProfile({ direcciones: updatedDirecciones });
  };

  const setDireccionPrincipal = async (id: string) => {
    if (!user || !profile) return;
    
    const updatedDirecciones = profile.direcciones.map(d => ({
      ...d,
      principal: d.id === id,
    }));
    await updateProfile({ direcciones: updatedDirecciones });
  };

  const addMetodoPago = async (metodo: Omit<MetodoPago, 'id'>) => {
    if (!user || !profile) return;
    
    const newMetodo: MetodoPago = {
      ...metodo,
      id: Date.now().toString(),
      principal: profile.metodosPago.length === 0 ? true : metodo.principal || false,
    };
    
    const updatedMetodos = [...profile.metodosPago, newMetodo];
    await updateProfile({ metodosPago: updatedMetodos });
  };

  const deleteMetodoPago = async (id: string) => {
    if (!user || !profile) return;
    
    const updatedMetodos = profile.metodosPago.filter(m => m.id !== id);
    await updateProfile({ metodosPago: updatedMetodos });
  };

  const setMetodoPagoPrincipal = async (id: string) => {
    if (!user || !profile) return;
    
    const updatedMetodos = profile.metodosPago.map(m => ({
      ...m,
      principal: m.id === id,
    }));
    await updateProfile({ metodosPago: updatedMetodos });
  };

  const getPedidos = async (): Promise<Pedido[]> => {
    if (!user) return [];
    
    try {
      const pedidosRef = collection(db, 'usuarios', user.uid, 'pedidos');
      const pedidosSnap = await getDocs(pedidosRef);
      return pedidosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pedido));
    } catch (error) {
      console.error('Error obteniendo pedidos:', error);
      return [];
    }
  };

  const getFactura = async (pedidoId: string): Promise<string | null> => {
    if (!user) return null;
    
    try {
      const facturaRef = doc(db, 'usuarios', user.uid, 'facturas', pedidoId);
      const facturaSnap = await getDoc(facturaRef);
      return facturaSnap.exists() ? facturaSnap.data().url : null;
    } catch (error) {
      console.error('Error obteniendo factura:', error);
      return null;
    }
  };

  const value = {
    profile,
    loading,
    updateProfile,
    direcciones: profile?.direcciones || [],
    metodosPago: profile?.metodosPago || [],
    pedidos: profile?.pedidos || [],
    addDireccion,
    updateDireccion,
    deleteDireccion,
    setDireccionPrincipal,
    addMetodoPago,
    deleteMetodoPago,
    setMetodoPagoPrincipal,
    getPedidos,
    getFactura,
  };

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
};