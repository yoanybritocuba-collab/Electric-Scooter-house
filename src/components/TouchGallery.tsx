import { useState, useEffect, useRef } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface TouchGalleryProps {
  images: string[];
  productName: string;
}

const TouchGallery = ({ images, productName }: TouchGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const galleryRef = useRef<HTMLDivElement>(null);

  // Manejar gestos táctiles para cambiar de imagen
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setIsDragging(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
    if (Math.abs(touchEndX.current - touchStartX.current) > 10) {
      setIsDragging(true);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;

    const difference = touchStartX.current - touchEndX.current;
    if (Math.abs(difference) < 50) return;

    if (difference > 0 && currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (difference < 0 && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
    
    setIsDragging(false);
  };

  // Prevenir scroll cuando se interactúa con la galería
  useEffect(() => {
    const preventScroll = (e: TouchEvent) => {
      if (isDragging && galleryRef.current?.contains(e.target as Node)) {
        e.preventDefault();
      }
    };

    document.addEventListener('touchmove', preventScroll, { passive: false });
    return () => document.removeEventListener('touchmove', preventScroll);
  }, [isDragging]);

  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-square bg-slate-800 rounded-2xl flex items-center justify-center">
        <span className="text-slate-500">Sin imagen</span>
      </div>
    );
  }

  return (
    <>
      {/* Galería principal */}
      <div 
        ref={galleryRef}
        className="relative w-full aspect-square bg-slate-900 rounded-2xl overflow-hidden touch-pan-y group"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Contenedor de imágenes con efecto slide */}
        <div 
          className="w-full h-full transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          <div className="flex h-full">
            {images.map((img, idx) => (
              <div key={idx} className="w-full h-full flex-shrink-0 flex items-center justify-center">
                <img
                  src={img}
                  alt={`${productName} - ${idx + 1}`}
                  className="w-full h-full object-contain"
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Controles de navegación - SOLO EN DESKTOP */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/70 transition-colors hidden md:block md:opacity-0 md:group-hover:opacity-100"
              aria-label="Imagen anterior"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setCurrentIndex(Math.min(images.length - 1, currentIndex + 1))}
              disabled={currentIndex === images.length - 1}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/70 transition-colors hidden md:block md:opacity-0 md:group-hover:opacity-100"
              aria-label="Siguiente imagen"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Indicador de página */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                idx === currentIndex 
                  ? 'w-4 bg-primary' 
                  : 'bg-white/50'
              }`}
              aria-label={`Ir a imagen ${idx + 1}`}
            />
          ))}
        </div>

        {/* Botón de pantalla completa */}
        <button
          onClick={() => setShowFullscreen(true)}
          className="absolute top-2 right-2 p-2 bg-black/50 rounded-lg text-white hover:bg-black/70 transition-colors"
          aria-label="Ver en pantalla completa"
        >
          <Maximize2 size={18} />
        </button>

        {/* Contador de imágenes */}
        <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 rounded-lg text-white text-xs">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Miniaturas - solo en desktop */}
      {images.length > 1 && (
        <div className="hidden md:flex gap-2 mt-4 overflow-x-auto pb-2 hide-scrollbar">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                idx === currentIndex 
                  ? 'border-primary scale-105' 
                  : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={img}
                alt={`Miniatura ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Modal de pantalla completa con ZOOM TÁCTIL - SIN BOTONES DE NAVEGACIÓN */}
      {showFullscreen && (
        <div 
          className="fixed inset-0 z-50 bg-black touch-none"
          onClick={() => setShowFullscreen(false)}
        >
          <div 
            className="relative w-full h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <TransformWrapper
              initialScale={1}
              minScale={1}
              maxScale={3}
              centerOnInit
              wheel={{ wheelDisabled: true }}
              pan={{ disabled: false }}
              pinch={{ step: 5 }}
              doubleClick={{ disabled: true }}
            >
              {({ zoomIn, zoomOut, resetTransform }) => (
                <>
                  <TransformComponent
                    wrapperClass="w-full h-full"
                    contentClass="w-full h-full flex items-center justify-center"
                  >
                    <img
                      src={images[currentIndex]}
                      alt={`${productName} - Ampliada`}
                      className="max-w-full max-h-full object-contain select-none"
                      draggable={false}
                    />
                  </TransformComponent>

                  {/* Controles de zoom (solo estos) */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/50 backdrop-blur-sm rounded-full p-1">
                    <button
                      onClick={() => zoomOut()}
                      className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
                      aria-label="Alejar"
                    >
                      <ZoomOut size={20} />
                    </button>
                    <button
                      onClick={() => resetTransform()}
                      className="px-3 py-1 text-white text-sm hover:bg-white/10 rounded-full transition-colors"
                    >
                      1:1
                    </button>
                    <button
                      onClick={() => zoomIn()}
                      className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
                      aria-label="Acercar"
                    >
                      <ZoomIn size={20} />
                    </button>
                  </div>

                  {/* Botón cerrar */}
                  <button
                    onClick={() => setShowFullscreen(false)}
                    className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                    aria-label="Cerrar"
                  >
                    <X size={24} />
                  </button>

                  {/* 🚫 NO HAY BOTONES DE NAVEGACIÓN AQUÍ */}
                  {/* Solo se puede cambiar de imagen con deslizamiento */}
                </>
              )}
            </TransformWrapper>
          </div>
        </div>
      )}

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
};

export default TouchGallery;