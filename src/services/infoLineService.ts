import { db } from "@/firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";

export interface InfoLineData {
  // Textos multilenguaje
  texto: string;
  texto_en: string;
  texto_gr: string;
  
  // Configuración visual
  color: string;           // Color de fondo
  colorTexto: string;      // Color del texto
  tamanoTexto: number;     // Tamaño de fuente en píxeles
  altoLinea: number;       // Altura de la línea en píxeles
  tipoLetra?: string;      // Fuente (opcional)
  
  // Configuración de animación (marquee)
  velocidad: number;       // Velocidad de desplazamiento
  direccion: 'left' | 'right';  // Dirección del movimiento
  
  // Configuración de posición
  posicion: 'top' | 'bottom';   // Dónde mostrar la línea
  
  // Estado y enlace
  activo: boolean;
  link?: string;           // Enlace opcional
  
  // Metadatos
  updatedAt?: Date;
}

const defaultInfo: InfoLineData = {
  texto: "Envío gratis en compras superiores a 50€",
  texto_en: "Free shipping on orders over 50€",
  texto_gr: "Δωρεάν αποστολή για παραγγελίες άνω των 50€",
  color: "#2ecc71",
  colorTexto: "#ffffff",
  tamanoTexto: 16,
  altoLinea: 40,
  tipoLetra: "inherit",
  velocidad: 80,
  direccion: "left",
  posicion: "top",
  activo: true,
  link: ""
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