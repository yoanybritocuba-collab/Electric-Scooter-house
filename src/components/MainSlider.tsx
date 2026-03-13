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
    }, 4000);
    return () => clearInterval(interval);
  }, [texts.length]);

  // Variantes de animación
  const textVariants = {
    enter: { 
      opacity: 0, 
      y: 100,
      scale: 0.8,
      rotateX: -15
    },
    center: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      rotateX: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1]
      }
    },
    exit: { 
      opacity: 0, 
      y: -100,
      scale: 0.8,
      rotateX: 15,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="relative w-full h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[calc(100vh-90px)] overflow-hidden mt-[90px]">
      {/* Imagen de fondo */}
      <img
        src="/images/hero/hero.png"
        alt={t("hero.future")}
        className="w-full h-full object-cover object-center brightness-90"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
      
      {/* Overlay degradado */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
      
      {/* Contenido centrado */}
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            variants={textVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="text-center max-w-6xl"
          >
            {/* Texto superior pequeño */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-2 sm:mb-4"
            >
              <span className="font-light text-white/60 text-sm sm:text-base md:text-lg uppercase tracking-[0.3em]">
                ELECTRIC SCOOTER HOUSE
              </span>
            </motion.div>
            
            {/* TEXTO PRINCIPAL - MODERNO Y LLAMATIVO */}
            <motion.h1
              className="font-black text-5xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[8rem] leading-[1.1] tracking-tight"
              style={{
                fontFamily: "'Poppins', 'Montserrat', sans-serif",
                background: 'linear-gradient(135deg, #FFFFFF 0%, #2ecc71 50%, #FFD700 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 20px 40px rgba(0,0,0,0.3)',
              }}
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              {texts[index]}
            </motion.h1>
            
            {/* Línea decorativa */}
            <motion.div 
              className="w-32 h-1 bg-gradient-to-r from-primary via-yellow-400 to-primary mx-auto my-6 sm:my-8 rounded-full"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 128, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            />
            
            {/* Subtítulo */}
            <motion.p 
              className="text-white/80 text-sm sm:text-base md:text-lg max-w-2xl mx-auto font-light"
              style={{
                fontFamily: "'Inter', sans-serif",
                letterSpacing: '0.02em'
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Innovación y estilo sobre ruedas
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Indicadores */}
      <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
        {texts.map((_, i) => (
          <motion.button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === index ? 'w-8 bg-primary' : 'w-2 bg-white/40 hover:bg-white/60'
            }`}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          />
        ))}
      </div>
    </div>
  );
};
export default MainSlider;