import { db } from "@/firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";

export interface HorarioData {
  lunesViernes: string;
  sabado: string;
  domingo: string;
  ultimaActualizacion: string;
}

const HORARIO_DOC_ID = "horario";

// Obtener horario
export const getHorario = async (): Promise<HorarioData | null> => {
  try {
    const docRef = doc(db, "configuracion", HORARIO_DOC_ID);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as HorarioData;
    }
    return null;
  } catch (error) {
    console.error("Error obteniendo horario:", error);
    return null;
  }
};

// Guardar/Actualizar horario
export const saveHorario = async (horario: HorarioData): Promise<boolean> => {
  try {
    const docRef = doc(db, "configuracion", HORARIO_DOC_ID);
    await setDoc(docRef, {
      ...horario,
      ultimaActualizacion: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error guardando horario:", error);
    return false;
  }
};

// Obtener horario con valores por defecto si no existe
export const getHorarioOrDefault = async (): Promise<HorarioData> => {
  const horario = await getHorario();
  if (horario) {
    return horario;
  }
  // Valores por defecto
  return {
    lunesViernes: "10:00 - 20:00",
    sabado: "10:00 - 14:00",
    domingo: "Cerrado",
    ultimaActualizacion: new Date().toISOString()
  };
};