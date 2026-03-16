import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

const MainSlider = () => {
  const { t } = useLanguage();
  const [index, setIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

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
    }, 6000);
    return () => clearInterval(interval);
  }, [texts.length]);

  const textVariants = {
    initial: { x: '-150vw', opacity: 0, scale: 0.5 },
    animate: { 
      x: 0, opacity: 1, scale: 1,
      transition: { type: "tween", ease: [0.42, 0, 0.58, 1], duration: 1.5 }
    },
    exit: { 
      x: '150vw', opacity: 0, scale: 0.5,
      transition: { type: "tween", ease: [0.42, 0, 0.58, 1], duration: 1.5 }
    }
  };

  const subTextVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { delay: 0.5, duration: 0.5 } }
  };

  const lineVariants = {
    initial: { width: 0, opacity: 0 },
    animate: { width: 128, opacity: 1, transition: { delay: 0.7, duration: 0.6 } }
  };

  return (
    <div className="relative w-full" style={{ height: 'calc(100vh - 80px)' }}>
      
      {/* MÓVIL - DOS IMÁGENES COMPLETAS JUNTAS (SIN EXPANDIRSE) */}
      <div className="sm:hidden absolute inset-0 flex flex-col">
        {/* Primera imagen - SIN EXPANDIRSE */}
        <div className="h-1/2 w-full flex items-center justify-center bg-black">
          <img
            src="/images/hero/hero.png"
            alt={t("hero.future")}
            className="h-full w-auto max-w-full object-contain"
            style={{ filter: 'brightness(1.2) contrast(1.1)' }}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => e.currentTarget.style.display = 'none'}
          />
        </div>

        {/* Segunda imagen - SIN EXPANDIRSE */}
        <div className="h-1/2 w-full flex items-center justify-center bg-black">
          <img
            src="/images/hero/hero.png"
            alt={t("hero.future")}
            className="h-full w-auto max-w-full object-contain"
            style={{ 
              filter: 'brightness(1.2) contrast(1.1)',
              transform: 'scaleX(-1)'
            }}
            onError={(e) => e.currentTarget.style.display = 'none'}
          />
        </div>
      </div>

      {/* DESKTOP - UNA SOLA IMAGEN */}
      <div className="hidden sm:block absolute inset-0">
        <img
          src="/images/hero/hero.png"
          alt={t("hero.future")}
          className="w-full h-full object-cover"
          style={{ filter: 'brightness(1.2) contrast(1.1)' }}
          onError={(e) => e.currentTarget.style.display = 'none'}
        />
      </div>
      
      {/* Loader mientras carga */}
      {!imageLoaded && (
        <div className="absolute inset-0 bg-black flex items-center justify-center z-30">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      {/* Overlay degradado */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent z-5" />
      
      {/* Contenido con animación */}
      <div className="absolute inset-0 flex items-center justify-center px-4 overflow-hidden z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            variants={textVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="text-center max-w-6xl"
          >
            {/* Texto superior pequeño */}
            <motion.div
              variants={subTextVariants}
              initial="initial"
              animate="animate"
              className="mb-2 md:mb-4"
            >
              <span className="font-light text-white/80 text-xs sm:text-sm md:text-base lg:text-lg uppercase tracking-[0.2em] drop-shadow-lg">
                ELECTRIC SCOOTER HOUSE
              </span>
            </motion.div>
            
            {/* TEXTO PRINCIPAL */}
            <motion.h1
              className="font-black text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl leading-[1.1] tracking-tight px-2"
              style={{
                fontFamily: "'Poppins', 'Montserrat', sans-serif",
                background: 'linear-gradient(135deg, #FFFFFF 0%, #2ecc71 80%, #FFD700 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 4px 8px rgba(0,0,0,0.8), 0 8px 16px rgba(0,0,0,0.5)',
              }}
            >
              {texts[index]}
            </motion.h1>
            
            {/* Línea decorativa */}
            <motion.div 
              className="w-16 sm:w-20 md:w-24 lg:w-32 h-0.5 sm:h-[3px] md:h-1 bg-gradient-to-r from-primary via-yellow-400 to-primary mx-auto my-4 md:my-6 rounded-full shadow-lg"
              variants={lineVariants}
              initial="initial"
              animate="animate"
            />
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Indicadores */}
      <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {texts.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`transition-all duration-300 rounded-full ${
              i === index 
                ? 'w-5 sm:w-6 md:w-7 lg:w-8 h-1.5 sm:h-2 bg-primary' 
                : 'w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white/50 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default MainSlider;