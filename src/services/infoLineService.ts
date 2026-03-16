import { db } from "@/firebase/config";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

export interface InfoLineData {
  texto: string;
  texto_en?: string;
  texto_gr?: string;
  activo: boolean;
  color?: string;
  link?: string;
}

const defaultInfo: InfoLineData = {
  texto: "Bienvenido a Electric Scooter House",
  activo: true,
  color: "#2ecc71"
};

export const getInfoLine = async (): Promise<InfoLineData> => {
  try {
    const docRef = doc(db, "informacion", "lineaInformativa");
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as InfoLineData;
    }
    return defaultInfo;
  } catch (error) {
    console.error("Error obteniendo línea informativa:", error);
    return defaultInfo;
  }
};

export const updateInfoLine = async (data: InfoLineData): Promise<void> => {
  try {
    const docRef = doc(db, "informacion", "lineaInformativa");
    await setDoc(docRef, {
      ...data,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error("Error actualizando línea informativa:", error);
    throw error;
  }
};