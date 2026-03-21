import { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

const MainSlider = () => {
  const { t } = useLanguage();
  const [imageLoaded, setImageLoaded] = useState(false);

  // Imagen fija para PC - solo la primera
  const image = '/images/hero/hero.avif';

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

  const [textIndex, setTextIndex] = useState(0);

  // Solo el texto cambia cada 6 segundos, la imagen es fija
  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % texts.length);
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

  useEffect(() => {
    console.log("🖼️ MainSlider montado - imagen fija:", image);
  }, []);

  const handleImageLoad = () => {
    console.log("✅ Imagen cargada correctamente");
    setImageLoaded(true);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error("❌ Error cargando imagen:", e.currentTarget.src);
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
      {/* IMAGEN FIJA - SIN ANIMACIÓN DE CAMBIO */}
      <div className="absolute inset-0">
        <img
          src={image}
          alt="Electric Scooter House"
          className="w-full h-full object-cover"
          style={{ 
            objectPosition: 'center'
          }}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      </div>
      
      {/* Loader mientras carga */}
      {!imageLoaded && (
        <div className="absolute inset-0 bg-black flex items-center justify-center z-30">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      {/* Overlay degradado */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent z-5" />
      
      {/* Contenido con animación de texto */}
      <div className="absolute inset-0 flex items-center justify-center px-4 overflow-hidden z-10">
        <motion.div
          key={textIndex}
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
          
          {/* TEXTO PRINCIPAL - CAMBIA CADA 6 SEGUNDOS */}
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
            {texts[textIndex]}
          </motion.h1>
          
          {/* Línea decorativa */}
          <motion.div 
            className="w-16 sm:w-20 md:w-24 lg:w-32 h-0.5 sm:h-[3px] md:h-1 bg-gradient-to-r from-primary via-yellow-400 to-primary mx-auto my-4 md:my-6 rounded-full shadow-lg"
            variants={lineVariants}
            initial="initial"
            animate="animate"
          />
        </motion.div>
      </div>
    </div>
  );
};

export default MainSlider;