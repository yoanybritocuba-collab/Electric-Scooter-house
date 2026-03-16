// Servicio de traducción usando Google Cloud Translation API
const API_KEY = "AIzaSyCS-PgbLLJpam7U0Kxm8vZgpw3GvEl7d_U"
interface TranslationResponse {
  data: {
    translations: {
      translatedText: string;
    }[];
  };
}

export const translateText = async (
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string> => {
  if (!text || text.trim() === "") return "";

  // Si el idioma origen es el mismo que el destino, devolver el mismo texto
  if (sourceLang === targetLang) return text;

  try {
    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          q: text,
          source: sourceLang,
          target: targetLang,
          format: "text",
        }),
      }
    );

    const data: TranslationResponse = await response.json();
    
    if (data.data && data.data.translations && data.data.translations[0]) {
      return data.data.translations[0].translatedText;
    }
    
    return text;
  } catch (error) {
    console.error("Error en traducción:", error);
    return text;
  }
};

// Mapeo de códigos de idioma (código interno -> código Google)
export const langCodes = {
  es: "es",
  en: "en",
  gr: "el", // Google usa 'el' para griego
};

// Función para traducir a todos los idiomas
export const translateToAll = async (
  text: string,
  sourceLang: string
): Promise<{ es: string; en: string; gr: string }> => {
  // Si no hay texto, devolver vacío
  if (!text || text.trim() === "") {
    return { es: "", en: "", gr: "" };
  }

  const result = {
    es: sourceLang === "es" ? text : "",
    en: sourceLang === "en" ? text : "",
    gr: sourceLang === "gr" ? text : "",
  };

  const promises = [];

  // Traducir a español si el origen no es español
  if (sourceLang !== "es") {
    promises.push(
      translateText(text, langCodes[sourceLang as keyof typeof langCodes], "es").then(
        (translated) => { result.es = translated; }
      )
    );
  }

  // Traducir a inglés si el origen no es inglés
  if (sourceLang !== "en") {
    promises.push(
      translateText(text, langCodes[sourceLang as keyof typeof langCodes], "en").then(
        (translated) => { result.en = translated; }
      )
    );
  }

  // Traducir a griego si el origen no es griego
  if (sourceLang !== "gr") {
    promises.push(
      translateText(text, langCodes[sourceLang as keyof typeof langCodes], "el").then(
        (translated) => { result.gr = translated; }
      )
    );
  }

  await Promise.all(promises);
  return result;
};