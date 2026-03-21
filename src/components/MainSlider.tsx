import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

const MainSlider = () => {
  const { t } = useLanguage();
  const [index, setIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Imágenes locales del proyecto
  const images = [
    '/images/hero/hero.avif',
    '/images/hero/hero1.avif',
    '/images/hero/hero2.avif',
    '/images/hero/hero3.avif',
    '/images/hero/hero4.avif'
  ];

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
      setIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

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

  useEffect(() => {
    console.log("🖼️ MainSlider montado - imágenes:", images);
  }, []);

  const handleImageLoad = () => {
    console.log("✅ Imagen cargada correctamente");
    setImageLoaded(true);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error("❌ Error cargando imagen:", e.currentTarget.src);
    // Usar imagen de respaldo
    e.currentTarget.src = "https://placehold.co/1920x1080/2a2a2a/2ecc71?text=Electric+Scooter+House";
    setImageLoaded(true);
  };

  return (
    <div 
      className="relative w-full overflow-hidden bg-black"
      style={{ 
        height: 'calc(100vh - 80px)',
        marginTop: 0,
        top: 0
      }}
    >
      {/* IMAGEN DE FONDO CON ANIMACIÓN */}
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0"
        >
          <img
            src={images[index]}
            alt="Electric Scooter House"
            className="w-full h-full object-cover"
            style={{ 
              objectPosition: 'center'
            }}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        </motion.div>
      </AnimatePresence>
      
      {/* Loader mientras carga */}
      {!imageLoaded && (
        <div className="absolute inset-0 bg-black flex items-center justify-center z-30">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      {/* Overlay degradado */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent z-5" />
      
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
              {texts[index % texts.length]}
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
      
      {/* Indicadores de imagen */}
      <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`transition-all duration-300 rounded-full ${
              i === index 
                ? 'w-5 sm:w-6 md:w-7 lg:w-8 h-1.5 sm:h-2 bg-primary' 
                : 'w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default MainSlider;