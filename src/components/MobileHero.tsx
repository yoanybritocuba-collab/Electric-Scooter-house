import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

const MobileHero = () => {
  const { t } = useLanguage();
  const [currentImage, setCurrentImage] = useState(0);
  const [textIndex, setTextIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const images = [
    '/images/heromobil/hero0.avif',
    '/images/heromobil/hero1.avif',
    '/images/heromobil/hero2.avif',
    '/images/heromobil/hero3.avif',
    '/images/heromobil/hero4.avif'
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

  // Sincronización: imagen y texto cambian JUNTOS cada 6 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
      setTextIndex((prev) => (prev + 1) % texts.length);
    }, 6000); // Cambia cada 6 segundos
    return () => clearInterval(interval);
  }, []);

  const textVariants = {
    initial: { 
      x: '-100vw', 
      opacity: 0,
      scale: 0.8,
      filter: 'blur(10px)'
    },
    animate: { 
      x: 0, 
      opacity: 1, 
      scale: 1,
      filter: 'blur(0px)',
      transition: { 
        type: "spring",
        damping: 12,
        stiffness: 100,
        duration: 1.2
      }
    },
    exit: { 
      x: '100vw', 
      opacity: 0, 
      scale: 0.8,
      filter: 'blur(10px)',
      transition: { 
        type: "spring",
        damping: 12,
        stiffness: 100,
        duration: 1.2
      }
    }
  };

  const imageVariants = {
    initial: { 
      opacity: 0,
      scale: 1.1
    },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 1.2,
        ease: "easeInOut"
      }
    },
    exit: { 
      opacity: 0,
      scale: 0.9,
      transition: { 
        duration: 1.2,
        ease: "easeInOut"
      }
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error("❌ Error cargando imagen móvil:", images[currentImage]);
    e.currentTarget.src = "https://placehold.co/600x400/2a2a2a/2ecc71?text=Hero+Mobile";
    setImageLoaded(true);
  };

  return (
    <div 
      style={{ 
        position: 'relative',
        width: '100%',
        height: 'calc(100vh - 80px)', // Altura total menos navbar
        backgroundColor: '#000000',
        overflow: 'hidden',
        top: 0,
        left: 0
      }}
    >
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
              objectFit: 'cover', // Ajusta la imagen al ancho sin cortar
              display: 'block',
            }}
            onLoad={() => setImageLoaded(true)}
            onError={handleImageError}
          />
        </motion.div>
      </AnimatePresence>

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

      {/* Overlay degradado */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.6), rgba(0,0,0,0.3))',
        zIndex: 5,
        pointerEvents: 'none'
      }} />

      {/* Contenido del texto */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100%',
        padding: '0 20px',
        textAlign: 'center',
        zIndex: 10,
        color: 'white',
        pointerEvents: 'none'
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={textIndex}
            variants={textVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div style={{
              fontSize: '14px',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              marginBottom: '12px',
              color: '#2ecc71',
              textShadow: '0 0 20px rgba(46, 204, 113, 0.5)'
            }}>
              ELECTRIC SCOOTER HOUSE
            </div>
            
            <h1 style={{
              fontSize: '32px',
              fontWeight: 900,
              lineHeight: 1.2,
              color: '#FF6B35',
              textShadow: '0 4px 8px rgba(0,0,0,0.8), 0 0 30px rgba(255, 107, 53, 0.5)',
              margin: 0,
              padding: '0 10px'
            }}>
              {texts[textIndex]}
            </h1>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Indicadores de imagen */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '10px',
        zIndex: 20
      }}>
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setCurrentImage(i);
              setTextIndex(i % texts.length); // Sincronizar texto al hacer clic
            }}
            style={{
              width: i === currentImage ? '30px' : '8px',
              height: '8px',
              borderRadius: '4px',
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