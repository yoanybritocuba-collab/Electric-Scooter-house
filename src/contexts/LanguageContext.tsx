import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import es from "@/translations/es.json";
import en from "@/translations/en.json";
import gr from "@/translations/gr.json";

type Lang = "es" | "en" | "gr";

interface Translations {
  [key: string]: any;
}

const translations: Record<Lang, Translations> = { es, en, gr };

interface LangContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LangContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage debe usarse dentro de LanguageProvider");
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Lang>(() => {
    try {
      const saved = localStorage.getItem("esh-lang") as Lang;
      return saved && translations[saved] ? saved : "es";
    } catch {
      return "es";
    }
  });

  // Actualizar el atributo lang del HTML cuando cambie el idioma
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const changeLang = useCallback((l: Lang) => {
    setLang(l);
    try {
      localStorage.setItem("esh-lang", l);
    } catch (error) {
      console.error("Error guardando idioma:", error);
    }
  }, []);

  const t = useCallback(
    (key: string): string => {
      try {
        const keys = key.split(".");
        let result: any = translations[lang];
        
        for (const k of keys) {
          if (result === undefined || result === null) {
            return key;
          }
          result = result[k];
        }
        
        return result !== undefined && result !== null ? result : key;
      } catch {
        return key;
      }
    },
    [lang]
  );

  const value = {
    lang,
    setLang: changeLang,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};