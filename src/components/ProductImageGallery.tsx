import { useState, useRef, useEffect } from "react";
import { ShoppingCart, Check, ImageOff } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  productId?: string;
  productNombre?: string;
  productNombreEn?: string;
  productNombreGr?: string;
  productPrecio?: number;
  onZoomStart?: () => void;
  onZoomEnd?: () => void;
  isZooming?: boolean;
}

const ProductImageGallery = ({
  images,
  productName,
  productId,
  productNombre,
  productNombreEn,
  productNombreGr,
  productPrecio,
  onZoomStart,
  onZoomEnd,
  isZooming = false
}: ProductImageGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const mainImageRef = useRef<HTMLDivElement>(null);
  const { addItem } = useCart();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const validImages = images.filter(img => img && img.trim() !== "" && !img.includes("placehold.co"));
  const displayImages = validImages.length > 0 ? validImages : [];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mainImageRef.current || isMobile || displayImages.length === 0) return;
    
    const { left, top, width, height } = mainImageRef.current.getBoundingClientRect();
    let x = ((e.clientX - left) / width) * 100;
    let y = ((e.clientY - top) / height) * 100;
    
    x = Math.min(Math.max(x, 0), 100);
    y = Math.min(Math.max(y, 0), 100);
    
    setZoomPosition({ x, y });
  };

  const handleMouseEnter = () => {
    if (!isMobile && displayImages.length > 0) {
      setIsHovering(true);
      if (onZoomStart) onZoomStart();
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    if (onZoomEnd) onZoomEnd();
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!productId || !productPrecio) return;
    
    addItem({
      id: productId,
      nombre: productNombre || productName,
      nombre_en: productNombreEn,
      nombre_gr: productNombreGr,
      precio: productPrecio,
      imagen: displayImages[0] || ""
    });
    
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1500);
  };

  if (displayImages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center aspect-square rounded-2xl bg-gray-900">
        <ImageOff size={48} className="text-gray-600 mb-3" />
        <p className="text-gray-500 text-sm">No hay imágenes disponibles</p>
      </div>
    );
  }

  // DESKTOP: Layout Amazon
  if (!isMobile) {
    return (
      <>
        {/* Imagen pequeña con cuadro de zoom */}
        <div 
          ref={mainImageRef}
          className="relative aspect-square rounded-2xl overflow-hidden bg-gray-900 cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <img
            src={displayImages[selectedIndex]}
            alt={productName}
            className="w-full h-full object-contain bg-gray-900"
          />
          
          {/* Cuadro de zoom */}
          {isHovering && (
            <div 
              className="absolute border-2 border-[#2ecc71] bg-[#2ecc71]/10 pointer-events-none"
              style={{
                width: '130px',
                height: '130px',
                left: `calc(${zoomPosition.x}% - 65px)`,
                top: `calc(${zoomPosition.y}% - 65px)`,
                boxShadow: '0 0 0 1px rgba(46,204,113,0.5)',
              }}
            />
          )}

          <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
            🔍 Zoom
          </div>
        </div>

        {/* Miniaturas */}
        {displayImages.length > 1 && (
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {displayImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedIndex(idx)}
                className={`relative flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                  selectedIndex === idx
                    ? "border-[#2ecc71] shadow-[0_0_10px_rgba(46,204,113,0.5)]"
                    : "border-gray-700 hover:border-gray-500"
                }`}
              >
                <img src={img} alt={`${productName} - ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Imagen ampliada (zoom) - solo visible cuando se hace hover */}
        {isHovering && (
          <div className="fixed right-0 top-1/2 -translate-y-1/2 w-[45vw] z-50 pointer-events-none" style={{ right: '2rem' }}>
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden bg-gray-900 border-2 border-[#2ecc71] shadow-2xl">
                <div 
                  className="w-full h-full bg-no-repeat"
                  style={{
                    backgroundImage: `url(${displayImages[selectedIndex]})`,
                    backgroundSize: '300%',
                    backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  }}
                />
              </div>
              <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#2ecc71] rounded-full shadow-lg" />
              <p className="text-center text-xs text-gray-400 mt-3">
                Mueve el mouse sobre la imagen izquierda para explorar los detalles
              </p>
            </div>
          </div>
        )}
      </>
    );
  }

  // MÓVIL: Layout simple con carrito flotante
  return (
    <>
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-900">
        <img
          src={displayImages[selectedIndex]}
          alt={productName}
          className="w-full h-full object-contain bg-gray-900"
        />
        <button
          onClick={handleAddToCart}
          className="absolute bottom-3 right-3 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-green-500 text-white hover:bg-green-600 shadow-lg"
        >
          {addedToCart ? <Check size={18} /> : <ShoppingCart size={18} />}
        </button>
      </div>

      {/* Miniaturas móvil */}
      {displayImages.length > 1 && (
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {displayImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={`relative flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                selectedIndex === idx
                  ? "border-[#2ecc71] shadow-[0_0_10px_rgba(46,204,113,0.5)]"
                  : "border-gray-700 hover:border-gray-500"
              }`}
            >
              <img src={img} alt={`${productName} - ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </>
  );
};

export default ProductImageGallery;