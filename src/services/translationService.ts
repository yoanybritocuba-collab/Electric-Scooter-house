interface TranslationResult {
  texto: string;
  error?: string;
}

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

    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=es|${targetLang}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.responseStatus === 200) {
      return { texto: data.responseData.translatedText };
    } else {
      throw new Error(data.responseDetails || 'Error en traducción');
    }
  } catch (error) {
    console.error(`Error traduciendo a ${targetLang}:`, error);
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
 * Traduce un objeto completo de especificaciones
 * @param specs Objeto de especificaciones a traducir
 */
export const translateSpecs = async (specs: any) => {
  const translatedSpecs: any = {};
  
  // Lista de campos a traducir
  const textFields = [
    'autonomia', 'peso', 'velocidad_max', 'motor', 'bateria', 
    'tiempo_carga', 'ruedas', 'cambios', 'frenos', 'iluminacion',
    'edad_recomendada', 'autonomia_bateria', 'max_peso', 'inclinacion_max', 'giro'
  ];
  
  // Traducir cada campo de texto
  for (const field of textFields) {
    if (specs[field] && typeof specs[field] === 'string' && specs[field].trim() !== '') {
      // Traducir a inglés si no existe
      if (!specs[`${field}_en`]) {
        const enResult = await translateText(specs[field], 'en');
        translatedSpecs[`${field}_en`] = enResult.texto;
      }
      
      // Traducir a griego si no existe
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
  
  // 1. Traducir nombre
  if (productData.nombre && productData.nombre.trim() !== '') {
    if (!productData.nombre_en || !productData.nombre_gr) {
      const nameEn = await translateText(productData.nombre, 'en');
      const nameGr = await translateText(productData.nombre, 'el');
      translations.nombre_en = nameEn.texto;
      translations.nombre_gr = nameGr.texto;
    }
  }
  
  // 2. Traducir descripción
  if (productData.descripcion && productData.descripcion.trim() !== '') {
    if (!productData.descripcion_en || !productData.descripcion_gr) {
      const descEn = await translateText(productData.descripcion, 'en');
      const descGr = await translateText(productData.descripcion, 'el');
      translations.descripcion_en = descEn.texto;
      translations.descripcion_gr = descGr.texto;
    }
  }
  
  // 3. Traducir especificaciones
  if (productData.especificaciones) {
    const specTranslations = await translateSpecs(productData.especificaciones);
    translations.especificaciones = specTranslations;
  }
  
  return translations;
};