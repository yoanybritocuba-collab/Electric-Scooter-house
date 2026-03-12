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
    
    // Usamos un proxy gratuito de traducción (alternativa sin API key)
    // En producción, deberías usar tu propia API key
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