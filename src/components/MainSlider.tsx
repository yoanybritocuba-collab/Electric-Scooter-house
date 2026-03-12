import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

const MainSlider = () => {
  const { t } = useLanguage();
  const [index, setIndex] = useState(0);

  const texts = [
    t("hero.future"),
    t("hero.zero"),
    t("hero.tech"),
    t("hero.clean"),
    t("hero.mobility"),
    t("hero.innovation"),
    t("hero.green"),
    t("hero.smart")
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % texts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [texts.length]);

  return (
    <div className="relative w-full h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[calc(100vh-90px)] overflow-hidden mt-[90px]">
      {/* Imagen de fondo - CORREGIDA para móviles */}
      <img
        src="/images/hero/hero.png"
        alt={t("hero.future")}
        className="w-full h-full object-cover object-center"
        onError={(e) => {
          // Si la imagen no carga, usar un color de fondo
          e.currentTarget.style.display = 'none';
        }}
      />
      {/* Fallback si la imagen no carga */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-background" />
      
      {/* Overlay oscuro para mejor legibilidad del texto */}
      <div className="absolute inset-0 bg-black/40" />
      
      {/* Contenido centrado */}
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <AnimatePresence mode="wait">
          <motion.h1
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8 }}
            className="font-display font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-center max-w-4xl"
            style={{
              color: '#2ecc71',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
            }}
          >
            {texts[index]}
          </motion.h1>
        </AnimatePresence>
      </div>
      
      {/* Indicadores */}
      <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {texts.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-1.5 sm:h-2 rounded-full transition-all ${
              i === index 
                ? 'w-6 sm:w-8 bg-[#2ecc71]' 
                : 'w-1.5 sm:w-2 bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Ir al slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default MainSlider;