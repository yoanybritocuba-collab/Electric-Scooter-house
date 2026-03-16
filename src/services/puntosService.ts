import { db } from "@/firebase/config";
import { doc, updateDoc, increment, getDoc, collection, addDoc, query, where, getDocs, orderBy, limit } from "firebase/firestore";

interface PuntosConfig {
  valorPunto: number;      // 0.01 = 100 puntos = 1€
  diasExpiracion: number;  // 365
}

interface CanjePuntos {
  usuarioId: string;
  puntos: number;
  descuento: number;       // En euros
  pedidoId?: string;
}

/**
 * Obtiene la configuración de puntos
 */
export const getPuntosConfig = async (): Promise<PuntosConfig> => {
  const configDoc = await getDoc(doc(db, "configuracion", "puntos"));
  if (configDoc.exists()) {
    return configDoc.data() as PuntosConfig;
  }
  return { valorPunto: 0.01, diasExpiracion: 365 };
};

/**
 * Calcula puntos a partir de un importe
 */
export const calcularPuntos = async (importe: number): Promise<number> => {
  const config = await getPuntosConfig();
  // Ejemplo: 100€ * 1 punto por euro = 100 puntos
  return Math.floor(importe); // 1 punto por euro
};

/**
 * Añade puntos a un usuario
 */
export const añadirPuntos = async (
  usuarioId: string, 
  puntos: number, 
  concepto: string,
  pedidoId?: string
) => {
  try {
    const usuarioRef = doc(db, "usuarios", usuarioId);
    
    // Actualizar puntos del usuario
    await updateDoc(usuarioRef, {
      puntos: increment(puntos)
    });

    // Registrar en historial
    await addDoc(collection(db, "puntos"), {
      usuarioId,
      tipo: "ganado",
      cantidad: puntos,
      concepto,
      pedidoId: pedidoId || null,
      fecha: new Date()
    });

    return true;
  } catch (error) {
    console.error("Error añadiendo puntos:", error);
    return false;
  }
};

/**
 * Canjea puntos por descuento
 */
export const canjearPuntos = async (
  usuarioId: string,
  puntosACanjear: number
): Promise<{ exito: boolean; descuento: number; error?: string }> => {
  try {
    const config = await getPuntosConfig();
    const usuarioRef = doc(db, "usuarios", usuarioId);
    const usuarioDoc = await getDoc(usuarioRef);

    if (!usuarioDoc.exists()) {
      return { exito: false, descuento: 0, error: "Usuario no encontrado" };
    }

    const puntosActuales = usuarioDoc.data().puntos || 0;

    if (puntosActuales < puntosACanjear) {
      return { exito: false, descuento: 0, error: "Puntos insuficientes" };
    }

    // Calcular descuento: 100 puntos = 1€ (valorPunto = 0.01)
    const descuento = puntosACanjear * config.valorPunto;

    // Restar puntos
    await updateDoc(usuarioRef, {
      puntos: increment(-puntosACanjear),
      puntosCanjeados: increment(puntosACanjear)
    });

    // Registrar canje
    await addDoc(collection(db, "puntos"), {
      usuarioId,
      tipo: "canjeado",
      cantidad: puntosACanjear,
      descuento,
      concepto: `Canje por ${descuento.toFixed(2)}€ de descuento`,
      fecha: new Date()
    });

    return { exito: true, descuento };
  } catch (error) {
    console.error("Error canjeando puntos:", error);
    return { exito: false, descuento: 0, error: "Error al canjear puntos" };
  }
};

/**
 * Obtiene historial de puntos de un usuario
 */
export const getHistorialPuntos = async (usuarioId: string) => {
  try {
    const q = query(
      collection(db, "puntos"),
      where("usuarioId", "==", usuarioId),
      orderBy("fecha", "desc"),
      limit(20)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error obteniendo historial:", error);
    return [];
  }
};

/**
 * Aplica descuento de puntos a un carrito
 */
export const aplicarDescuentoPuntos = (total: number, puntos: number, config: PuntosConfig) => {
  const descuentoMaximo = puntos * config.valorPunto;
  return Math.min(descuentoMaximo, total);
};