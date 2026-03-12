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
      {/* Botón principal - 3 tamaños diferentes */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-0.5 sm:gap-1 px-1 sm:px-1.5 md:px-2 py-0.5 sm:py-1 md:py-1.5 rounded-lg bg-secondary border border-border hover:border-primary/30 transition-all duration-200"
        aria-label="Seleccionar idioma"
      >
        {/* Móvil pequeño */}
        <Globe size={12} className="text-muted-foreground sm:hidden md:hidden" />
        {/* Móvil grande/tablet */}
        <Globe size={14} className="text-muted-foreground hidden sm:block md:hidden" />
        {/* Desktop */}
        <Globe size={16} className="text-muted-foreground hidden md:block" />
        
        {/* Bandera - 3 tamaños */}
        <span className="text-xs sm:text-sm md:text-base">{flags[lang]}</span>
      </button>

      {/* Dropdown - responsive */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-24 sm:w-28 md:w-32 bg-background border border-border rounded-lg shadow-lg overflow-hidden z-50">
          {langs.map((l) => (
            <button
              key={l}
              onClick={() => handleSelect(l)}
              className={`w-full flex items-center gap-1 sm:gap-1.5 md:gap-2 px-1.5 sm:px-2 md:px-3 py-1 sm:py-1.5 md:py-2 text-left transition-colors hover:bg-secondary ${
                lang === l ? 'bg-primary/10 text-primary' : 'text-foreground'
              }`}
            >
              <span className="text-sm sm:text-base md:text-lg">{flags[l]}</span>
              {lang === l && (
                <span className="text-primary text-xs ml-auto">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;