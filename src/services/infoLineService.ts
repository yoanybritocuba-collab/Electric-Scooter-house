import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "@/firebase/config";

export interface InfoLineData {
  texto: string;
  texto_en?: string;
  texto_gr?: string;
  color: string;
  colorTexto: string;
  tamanoTexto: number;
  altoLinea: number;
  tipoLetra: string;
  velocidad: number;
  direccion: 'left' | 'right';
  posicion: 'top' | 'bottom';
  activo: boolean;
  link?: string;
}

export const getInfoLine = async (): Promise<InfoLineData> => {
  try {
    const configSnap = await getDocs(collection(db, "configuracion"));
    const infoLineDoc = configSnap.docs.find(d => d.id === "informacion");
    
    if (infoLineDoc?.exists()) {
      return infoLineDoc.data() as InfoLineData;
    }
    
    // Configuración por defecto
    return {
      texto: "Bienvenido a Electric Scooter House",
      texto_en: "Welcome to Electric Scooter House",
      texto_gr: "Καλώς ήρθατε στο Electric Scooter House",
      color: "#2ecc71",
      colorTexto: "#ffffff",
      tamanoTexto: 16,
      altoLinea: 28,
      tipoLetra: "inherit",
      velocidad: 200,
      direccion: "left",
      posicion: "top",
      activo: true,
      link: ""
    };
  } catch (error) {
    console.error("Error cargando línea informativa:", error);
    throw error;
  }
};

export const updateInfoLine = async (data: InfoLineData): Promise<void> => {
  try {
    await setDoc(doc(db, "configuracion", "informacion"), data);
  } catch (error) {
    console.error("Error actualizando línea informativa:", error);
    throw error;
  }
};