import { useLanguage } from "@/contexts/LanguageContext";
import { Globe } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const flags: Record<string, string> = {
  es: "🇪🇸",
  en: "🇬🇧",
  gr: "🇬🇷",
};

const LanguageSelector = () => {
  const { lang, setLang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const langs = ["es", "en", "gr"] as const;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (l: typeof langs[number]) => {
    setLang(l);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón SIN FONDO, SIN BORDE - solo icono y bandera pequeña */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 p-1 text-muted-foreground hover:text-primary transition-colors"
        aria-label="Seleccionar idioma"
      >
        <Globe size={20} className="text-current" />
        <span className="text-sm leading-none mt-0.5">{flags[lang]}</span>
      </button>

      {/* Dropdown de idiomas */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-background border border-border rounded-lg shadow-lg overflow-hidden z-50">
          {langs.map((l) => (
            <button
              key={l}
              onClick={() => handleSelect(l)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-secondary ${
                lang === l ? 'bg-primary/10 text-primary' : 'text-foreground'
              }`}
            >
              <span className="text-lg">{flags[l]}</span>
              <span className="flex-1 text-sm">{l.toUpperCase()}</span>
              {lang === l && (
                <span className="text-primary text-xs">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;