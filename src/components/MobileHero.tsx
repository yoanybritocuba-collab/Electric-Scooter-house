import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

const MobileHero = () => {
  const { t } = useLanguage();
  const [currentImage, setCurrentImage] = useState(0);
  const [textIndex, setTextIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const images = [
    '/images/heromobil/hero0-mobile.avif',
    '/images/heromobil/hero1-mobile.avif',
    '/images/heromobil/hero2-mobile.avif',
    '/images/heromobil/hero3-mobile.avif',
    '/images/heromobil/hero4-mobile.avif'
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

  // Cambiar imagen cada 6 segundos
  useEffect(() => {
    const imageInterval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 6000);
    return () => clearInterval(imageInterval);
  }, []);

  // Cambiar texto cada 6 segundos
  useEffect(() => {
    const textInterval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % texts.length);
    }, 6000);
    return () => clearInterval(textInterval);
  }, [texts.length]);

  // 🚗 EFECTO LETRAS SUAVE
  const textVariants = {
    initial: { 
      x: '-120vw', 
      opacity: 0,
      scale: 0.9,
      filter: 'blur(8px)'
    },
    animate: { 
      x: 0, 
      opacity: 1, 
      scale: 1,
      filter: 'blur(0px)',
      transition: { 
        type: "tween",
        ease: [0.25, 0.1, 0.25, 1],
        duration: 1.5
      }
    },
    exit: { 
      x: '120vw', 
      opacity: 0, 
      scale: 0.9,
      filter: 'blur(8px)',
      transition: { 
        type: "tween",
        ease: [0.25, 0.1, 0.25, 1],
        duration: 1.5
      }
    }
  };

  const subTextVariants = {
    initial: { 
      opacity: 0, 
      y: 30,
      filter: 'blur(5px)'
    },
    animate: { 
      opacity: 1, 
      y: 0,
      filter: 'blur(0px)',
      transition: { 
        delay: 0.4, 
        duration: 1,
        ease: [0.25, 0.1, 0.25, 1]
      }
    },
    exit: { 
      opacity: 0, 
      y: -30,
      filter: 'blur(5px)',
      transition: { 
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  };

  // ✨ FUNDIDO CRUZADO
  const imageVariants = {
    initial: { 
      opacity: 0
    },
    animate: { 
      opacity: 1,
      transition: { 
        duration: 1.2,
        ease: "easeInOut"
      }
    },
    exit: { 
      opacity: 0,
      transition: { 
        duration: 1.2,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div style={{ 
      position: 'relative',
      width: '100%',
      height: 'calc(100vh - 80px)', // 👈 Altura total menos navbar
      backgroundColor: '#000000',
      overflow: 'hidden',
      // SIN marginTop - la imagen empieza justo debajo del navbar
    }}>
      {/* Contenedor de imágenes - OCUPA TODO EL ESPACIO */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}>
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentImage}
            variants={imageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
            }}
          >
            <img
              src={images[currentImage]}
              alt={`Hero ${currentImage + 1}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover', // 👈 La imagen cubre TODO el espacio sin dejar negro
                objectPosition: 'center',
                display: 'block',
              }}
              onLoad={() => setImageLoaded(true)}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Loader */}
      {!imageLoaded && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#000000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 30
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #2ecc71',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        </div>
      )}

      {/* Overlay suave */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.3), rgba(0,0,0,0.1))',
        zIndex: 5,
        pointerEvents: 'none'
      }} />

      {/* Contenido con letras al 35% */}
      <div style={{
        position: 'absolute',
        top: '35%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100%',
        maxWidth: '100%',
        padding: '0 16px',
        textAlign: 'center',
        zIndex: 10,
        color: 'white',
        pointerEvents: 'none',
        boxSizing: 'border-box'
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={textIndex}
            variants={textVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <motion.div
              variants={subTextVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.2em',
                marginBottom: '8px',
                color: '#2ecc71',
                fontFamily: "'Orbitron', 'Poppins', 'Montserrat', sans-serif",
                textShadow: '0 0 20px rgba(46, 204, 113, 0.5)'
              }}
            >
              ELECTRIC SCOOTER HOUSE
            </motion.div>
            
            <motion.h1
              variants={subTextVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{
                fontSize: '28px',
                fontWeight: 900,
                lineHeight: 1.2,
                fontFamily: "'Orbitron', 'Poppins', 'Montserrat', sans-serif",
                color: '#FF6B35',
                textShadow: '0 4px 8px rgba(0,0,0,0.8), 0 0 30px rgba(255, 107, 53, 0.5)',
                margin: 0,
                padding: '0 10px',
                maxWidth: '100%',
                wordWrap: 'break-word'
              }}
            >
              {texts[textIndex]}
            </motion.h1>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Indicadores de imagen */}
      <div style={{
        position: 'absolute',
        bottom: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '8px',
        zIndex: 20
      }}>
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentImage(i)}
            style={{
              width: i === currentImage ? '24px' : '6px',
              height: '6px',
              borderRadius: '999px',
              backgroundColor: i === currentImage ? '#FF6B35' : 'rgba(255,255,255,0.5)',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              transition: 'width 0.3s ease'
            }}
            aria-label={`Imagen ${i + 1}`}
          />
        ))}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default MobileHero;