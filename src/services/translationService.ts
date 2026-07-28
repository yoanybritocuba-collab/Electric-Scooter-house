// Servicio de traducción usando Google Cloud Translation API
// 🔑 La API Key se toma desde variables de entorno

interface TranslationResult {
  texto: string;
  error?: string;
}

// ============================================================
// 🔥 OBTENER API KEY DESDE VARIABLES DE ENTORNO
// ============================================================
const getApiKey = (): string => {
  // Prioridad: 1. Vercel (producción), 2. Local (.env)
  return import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY || 
         process.env.GOOGLE_TRANSLATE_API_KEY || 
         '';
};

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

    const API_KEY = getApiKey();
    if (!API_KEY) {
      console.warn('⚠️ No hay API Key de Google Translate, usando MyMemory');
      return await fallbackTranslate(text, targetLang);
    }

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
    // Si falla, usar MyMemory como respaldo
    return await fallbackTranslate(text, targetLang);
  } catch (error) {
    console.error(`Error con Google Translate, usando MyMemory:`, error);
    return await fallbackTranslate(text, targetLang);
  }
};

// Fallback con MyMemory (gratuita, sin API Key)
const fallbackTranslate = async (text: string, targetLang: 'en' | 'el'): Promise<TranslationResult> => {
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=es|${targetLang}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.responseStatus === 200) {
      return { texto: data.responseData.translatedText };
    } else {
      throw new Error(data.responseDetails || 'Error en traducción');
    }
  } catch (error) {
    console.error('Error en MyMemory:', error);
    return {
      texto: '',
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};

/**
 * Traduce un texto a múltiples idiomas simultáneamente
 */
export const translateToAllLanguages = async (text: string) => {
  const [en, el] = await Promise.all([
    translateText(text, 'en'),
    translateText(text, 'el')
  ]);

  return {
    en: en.texto,
    el: el.texto,
    errors: {
      en: en.error,
      el: el.error
    }
  };
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
    const API_KEY = getApiKey();
    if (!API_KEY) {
      console.warn('⚠️ No hay API Key, usando MyMemory para translateToAll');
      // Fallback con MyMemory
      const enResult = await fallbackTranslate(text, 'en');
      const grResult = await fallbackTranslate(text, 'el');
      result.en = enResult.texto;
      result.gr = grResult.texto;
      return result;
    }

    if (sourceLang === 'es') {
      const [en, gr] = await Promise.all([
        translateText(text, 'en'),
        translateText(text, 'el')
      ]);
      result.en = en.texto;
      result.gr = gr.texto;
    } else if (sourceLang === 'en') {
      const url = `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: text, target: 'es', format: 'text' })
      });
      const data = await response.json();
      result.es = data.data?.translations?.[0]?.translatedText || '';
      const gr = await translateText(text, 'el');
      result.gr = gr.texto;
    } else if (sourceLang === 'gr') {
      const urlEs = `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`;
      const responseEs = await fetch(urlEs, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: text, target: 'es', format: 'text' })
      });
      const dataEs = await responseEs.json();
      result.es = dataEs.data?.translations?.[0]?.translatedText || '';
      
      const urlEn = `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`;
      const responseEn = await fetch(urlEn, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: text, target: 'en', format: 'text' })
      });
      const dataEn = await responseEn.json();
      result.en = dataEn.data?.translations?.[0]?.translatedText || '';
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