import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getHistorialPuntos, 
  getPuntosConfig,
  canjearPuntos,
  type PuntosConfig 
} from '@/services/puntosService';

export const usePuntos = () => {
  const { user, userProfile, puntos } = useAuth();
  const [historial, setHistorial] = useState<any[]>([]);
  const [config, setConfig] = useState<PuntosConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      cargarDatos();
    }
  }, [user]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [historialData, configData] = await Promise.all([
        getHistorialPuntos(user!.uid),
        getPuntosConfig()
      ]);
      setHistorial(historialData);
      setConfig(configData);
    } catch (error) {
      console.error("Error cargando datos de puntos:", error);
    } finally {
      setLoading(false);
    }
  };

  const canjear = async (puntos: number) => {
    if (!user) return { exito: false, descuento: 0, error: "No autenticado" };
    const resultado = await canjearPuntos(user.uid, puntos);
    if (resultado.exito) {
      await cargarDatos(); // Recargar datos
    }
    return resultado;
  };

  const puntosEnEuros = config ? (puntos * config.valorPunto).toFixed(2) : "0";

  return {
    puntos,
    historial,
    config,
    loading,
    canjear,
    puntosEnEuros
  };
};