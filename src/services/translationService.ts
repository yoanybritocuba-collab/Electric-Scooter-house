// Servicio de traducción usando Google Cloud Translation API
// 🔑 CLAVE DE API FIJA (SOLUCIÓN DEFINITIVA)

interface TranslationResult {
  texto: string;
  error?: string;
}

// ============================================================
// 🔥 CLAVE DE API FIJA (NO depende de Vercel)
// ============================================================
const API_KEY = 'AIzaSyBkvvi3-pS_VFraSPMQXutkx9660o6eU9s';

/**
 * Traduce un texto usando la API REST de Google Translate
 * @param text Texto a traducir
 * @param targetLang Idioma destino ('en' o 'el')
 */
export const translateText = async (
  text: string,
  targetLang: 'en' | 'el'
): Promise<TranslationResult> => {
  try {
    if (!text.trim()) return { texto: '' };

    const url = `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: text,
        target: targetLang,
        format: "text",
      }),
    });

    const data = await response.json();
    
    if (data.data && data.data.translations && data.data.translations[0]) {
      return { texto: data.data.translations[0].translatedText };
    }
    
    console.error('Error en Google Translate:', data);
    return { texto: text, error: 'Error en traducción' };
  } catch (error) {
    console.error('Error en traducción:', error);
    return { texto: text, error: error.message };
  }
};

/**
 * Traduce un texto a TODOS los idiomas (español, inglés, griego)
 * @param text Texto a traducir
 * @param sourceLang Idioma de origen ('es', 'en', 'gr')
 */
export const translateToAll = async (
  text: string,
  sourceLang: string
): Promise<{ es: string; en: string; gr: string }> => {
  const result = {
    es: sourceLang === 'es' ? text : '',
    en: sourceLang === 'en' ? text : '',
    gr: sourceLang === 'gr' ? text : ''
  };

  try {
    if (sourceLang === 'es') {
      const [en, gr] = await Promise.all([
        translateText(text, 'en'),
        translateText(text, 'el')
      ]);
      result.en = en.texto;
      result.gr = gr.texto;
    } else if (sourceLang === 'en') {
      const es = await translateText(text, 'es');
      result.es = es.texto;
      const gr = await translateText(text, 'el');
      result.gr = gr.texto;
    } else if (sourceLang === 'gr') {
      const es = await translateText(text, 'es');
      result.es = es.texto;
      const en = await translateText(text, 'en');
      result.en = en.texto;
    }

    return result;
  } catch (error) {
    console.error('Error en traducción múltiple:', error);
    return result;
  }
};

/**
 * Traduce un objeto completo de especificaciones
 * @param specs Objeto de especificaciones a traducir
 */
export const translateSpecs = async (specs: any) => {
  const translatedSpecs: any = {};
  
  const textFields = [
    'autonomia', 'peso', 'velocidad_max', 'motor', 'bateria', 
    'tiempo_carga', 'ruedas', 'cambios', 'frenos', 'iluminacion',
    'edad_recomendada', 'autonomia_bateria', 'max_peso', 'inclinacion_max', 'giro'
  ];
  
  for (const field of textFields) {
    if (specs[field] && typeof specs[field] === 'string' && specs[field].trim() !== '') {
      if (!specs[`${field}_en`]) {
        const enResult = await translateText(specs[field], 'en');
        translatedSpecs[`${field}_en`] = enResult.texto;
      }
      if (!specs[`${field}_gr`]) {
        const grResult = await translateText(specs[field], 'el');
        translatedSpecs[`${field}_gr`] = grResult.texto;
      }
    }
  }
  
  return translatedSpecs;
};

/**
 * Traduce TODO el producto completo
 * @param productData Datos completos del producto
 */
export const translateFullProduct = async (productData: any) => {
  const translations: any = {};
  
  if (productData.nombre && productData.nombre.trim() !== '') {
    if (!productData.nombre_en || !productData.nombre_gr) {
      const nameEn = await translateText(productData.nombre, 'en');
      const nameGr = await translateText(productData.nombre, 'el');
      translations.nombre_en = nameEn.texto;
      translations.nombre_gr = nameGr.texto;
    }
  }
  
  if (productData.descripcion && productData.descripcion.trim() !== '') {
    if (!productData.descripcion_en || !productData.descripcion_gr) {
      const descEn = await translateText(productData.descripcion, 'en');
      const descGr = await translateText(productData.descripcion, 'el');
      translations.descripcion_en = descEn.texto;
      translations.descripcion_gr = descGr.texto;
    }
  }
  
  if (productData.especificaciones) {
    const specTranslations = await translateSpecs(productData.especificaciones);
    translations.especificaciones = specTranslations;
  }
  
  return translations;
};

export default {
  translateText,
  translateToAll,
  translateSpecs,
  translateFullProduct,
};