import { useState, useEffect } from 'react';
import { useLanguage } from "@/contexts/LanguageContext";

const MobileHero = () => {
  const { t } = useLanguage();
  const [currentImage, setCurrentImage] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [error, setError] = useState(false);
  
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

  // Cambiar imagen cada 12 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 12000); // 12 segundos
    return () => clearInterval(interval);
  }, []);

  // Cambiar texto cada 6 segundos
  const [textIndex, setTextIndex] = useState(0);
  useEffect(() => {
    const textInterval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % texts.length);
    }, 6000);
    return () => clearInterval(textInterval);
  }, []);

  const handleImageError = () => {
    console.error("❌ Error cargando imagen:", images[currentImage]);
    setError(true);
  };

  return (
    <div style={{ 
      position: 'relative',
      width: '100%',
      height: 'calc(100vh - 80px)',
      backgroundColor: '#000000',
      overflow: 'hidden',
    }}>
      {/* IMAGEN ACTUAL */}
      <img
        key={currentImage}
        src={images[currentImage]}
        alt={`Hero ${currentImage + 1}`}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          transition: 'opacity 1s ease-in-out'
        }}
        onLoad={() => setImagesLoaded(true)}
        onError={handleImageError}
      />

      {/* Overlay degradado */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.4), rgba(0,0,0,0.2))',
        zIndex: 5,
        pointerEvents: 'none'
      }} />

      {/* TEXTO */}
      <div style={{
        position: 'absolute',
        top: '35%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100%',
        padding: '0 16px',
        textAlign: 'center',
        zIndex: 10,
        color: 'white',
        pointerEvents: 'none'
      }}>
        <div style={{
          fontSize: '12px',
          textTransform: 'uppercase',
          letterSpacing: '0.2em',
          marginBottom: '8px',
          color: '#2ecc71',
          textShadow: '0 0 20px rgba(46, 204, 113, 0.5)',
          transition: 'opacity 0.5s ease-in-out'
        }}>
          ELECTRIC SCOOTER HOUSE
        </div>
        
        <h1 style={{
          fontSize: '28px',
          fontWeight: 900,
          lineHeight: 1.2,
          color: '#FF6B35',
          textShadow: '0 4px 8px rgba(0,0,0,0.8), 0 0 30px rgba(255, 107, 53, 0.5)',
          margin: 0,
          padding: '0 10px',
          transition: 'opacity 0.5s ease-in-out'
        }}>
          {texts[textIndex]}
        </h1>
      </div>

      {/* INDICADORES */}
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
          <div
            key={i}
            style={{
              width: i === currentImage ? '24px' : '6px',
              height: '6px',
              borderRadius: '999px',
              backgroundColor: i === currentImage ? '#FF6B35' : 'rgba(255,255,255,0.5)',
              transition: 'width 0.3s ease'
            }}
          />
        ))}
      </div>

      {/* MENSAJE DE ERROR SI FALLA */}
      {error && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'red',
          backgroundColor: 'rgba(0,0,0,0.8)',
          padding: '20px',
          borderRadius: '10px',
          zIndex: 100
        }}>
          Error cargando imágenes
        </div>
      )}
    </div>
  );
};

export default MobileHero;