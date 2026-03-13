import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
}

const ProductImageGallery = ({ images, productName }: ProductImageGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const touchMoveRef = useRef<{ x: number; y: number } | null>(null);

  // CAMBIO DE IMÁGENES CON DESLIZAMIENTO
  useEffect(() => {
    const container = containerRef.current;
    if (!container || isFullscreen) return;

    let startX = 0;
    let isDragging = false;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      isDragging = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      e.preventDefault();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isDragging) return;
      
      const endX = e.changedTouches[0].clientX;
      const diff = startX - endX;

      if (Math.abs(diff) > 50) { // Umbral de deslizamiento
        if (diff > 0) {
          // Deslizó a la izquierda -> siguiente imagen
          setSelectedIndex((prev) => (prev + 1) % images.length);
        } else {
          // Deslizó a la derecha -> imagen anterior
          setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);
        }
      }
      
      isDragging = false;
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [images.length, isFullscreen]);

  // ZOOM CON GESTOS EN PANTALLA COMPLETA
  useEffect(() => {
    if (!isFullscreen) return;

    const container = containerRef.current;
    if (!container) return;

    let initialDistance = 0;
    let initialZoom = 1;
    let lastTap = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        initialDistance = Math.sqrt(dx * dx + dy * dy);
        initialZoom = zoomLevel;
        setIsZoomed(true);
      } else if (e.touches.length === 1) {
        // Detectar doble tap para reset
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        if (tapLength < 300 && tapLength > 0) {
          setZoomLevel(1);
          setIsZoomed(false);
        }
        lastTap = currentTime;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const currentDistance = Math.sqrt(dx * dx + dy * dy);
        const scale = currentDistance / initialDistance;
        const newZoom = Math.min(3, Math.max(1, initialZoom * scale));
        setZoomLevel(newZoom);
        setIsZoomed(newZoom > 1);
      } else if (e.touches.length === 1 && isZoomed) {
        // Arrastrar imagen cuando está ampliada
        e.preventDefault();
        const touch = e.touches[0];
        const img = imageRef.current;
        if (!img) return;

        // Lógica de arrastre aquí
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        initialDistance = 0;
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isFullscreen, zoomLevel, isZoomed]);

  // LUPA TÁCTIL PROFESIONAL
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isFullscreen && e.touches.length === 1) {
      const touch = e.touches[0];
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((touch.clientX - rect.left) / rect.width) * 100;
      const y = ((touch.clientY - rect.top) / rect.height) * 100;
      
      // Aquí podrías implementar una lupa que sigue el dedo
      // Pero es más común en desktop, en móvil se usa pellizco
    }
  };

  return (
    <>
      {/* Galería principal */}
      <div 
        ref={containerRef}
        className="relative aspect-square rounded-xl overflow-hidden bg-gray-900 touch-pan-y"
        onClick={() => setIsFullscreen(true)}
      >
        <img
          ref={imageRef}
          src={images[selectedIndex]}
          alt={`${productName} - Imagen ${selectedIndex + 1}`}
          className="w-full h-full object-contain select-none pointer-events-none"
          draggable={false}
        />

        {/* Indicador de posición (sin botones) */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  i === selectedIndex 
                    ? 'w-4 bg-[#2ecc71]' 
                    : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}

        {/* Contador de imágenes (opcional, pequeño) */}
        {images.length > 1 && (
          <div className="absolute top-3 right-3 bg-black/50 backdrop-blur px-2 py-1 rounded-full text-xs text-white/80">
            {selectedIndex + 1}/{images.length}
          </div>
        )}
      </div>

      {/* Miniaturas (para navegación rápida) */}
      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2 mt-4">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => {
                setSelectedIndex(index);
                setZoomLevel(1);
              }}
              className={`relative aspect-square rounded-lg overflow-hidden transition-all ${
                index === selectedIndex
                  ? 'ring-2 ring-[#2ecc71] ring-offset-2 ring-offset-black'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={img}
                alt={`${productName} - miniatura ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Modal de pantalla completa con ZOOM TÁCTIL PROFESIONAL */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black"
            onClick={() => setIsFullscreen(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="relative w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
              ref={containerRef}
            >
              {/* Botón cerrar minimalista */}
              <button
                onClick={() => setIsFullscreen(false)}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 backdrop-blur rounded-full flex items-center justify-center text-white/80 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              {/* Imagen con zoom */}
              <div 
                className="relative w-full h-full overflow-hidden"
                style={{
                  transform: `scale(${zoomLevel})`,
                  transition: zoomLevel === 1 ? 'transform 0.2s ease-out' : 'none',
                }}
              >
                <img
                  src={images[selectedIndex]}
                  alt={productName}
                  className="w-full h-full object-contain"
                  draggable={false}
                />
              </div>

              {/* Indicador de zoom */}
              {zoomLevel > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur px-3 py-1.5 rounded-full text-xs text-white/80">
                  {Math.round(zoomLevel * 100)}% • Doble tap para reset
                </div>
              )}

              {/* Indicadores de navegación (sin botones, solo visual) */}
              {images.length > 1 && (
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <div
                      key={i}
                      className={`w-1 h-1 rounded-full transition-all duration-300 ${
                        i === selectedIndex ? 'w-3 bg-[#2ecc71]' : 'bg-white/30'
                      }`}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProductImageGallery;