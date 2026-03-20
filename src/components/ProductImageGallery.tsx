import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, ShoppingCart, Check } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  productId?: string;
  productNombre?: string;
  productNombreEn?: string;
  productNombreGr?: string;
  productPrecio?: number;
}

const ProductImageGallery = ({
  images,
  productName,
  productId,
  productNombre,
  productNombreEn,
  productNombreGr,
  productPrecio
}: ProductImageGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const { addItem } = useCart();

  const validImages = images.filter(img => img && img.trim() !== "");
  const displayImages = validImages.length > 0 ? validImages : ["https://placehold.co/600x400/2a2a2a/2ecc71?text=Sin+imagen"];

  const openModal = (index: number) => {
    setModalIndex(index);
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = "auto";
  };

  const nextImage = () => {
    setModalIndex((prev) => (prev + 1) % displayImages.length);
  };

  const prevImage = () => {
    setModalIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isModalOpen) return;
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!productId) {
      console.log("❌ No se puede añadir: falta productId");
      return;
    }
    
    if (!productPrecio) {
      console.log("❌ No se puede añadir: falta productPrecio");
      return;
    }
    
    console.log("🛒 AÑADIENDO DESDE GALERÍA:", {
      id: productId,
      nombre: productNombre || productName,
      precio: productPrecio
    });
    
    addItem({
      id: productId,
      nombre: productNombre || productName,
      nombre_en: productNombreEn,
      nombre_gr: productNombreGr,
      precio: productPrecio,
      imagen: displayImages[0]
    });
    
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1500);
  };

  return (
    <>
      {/* Galería principal */}
      <div className="space-y-4">
        {/* Imagen principal */}
        <div 
          className="relative aspect-square rounded-2xl overflow-hidden bg-gray-900 cursor-pointer group"
          onClick={() => openModal(selectedIndex)}
        >
          <img
            src={displayImages[selectedIndex]}
            alt={productName}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <span className="bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              🔍 Ampliar
            </span>
          </div>
        </div>

        {/* Miniaturas */}
        {displayImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {displayImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedIndex(idx)}
                className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                  selectedIndex === idx
                    ? "border-[#2ecc71] shadow-[0_0_10px_rgba(46,204,113,0.5)]"
                    : "border-gray-700 hover:border-gray-500"
                }`}
              >
                <img
                  src={img}
                  alt={`${productName} - ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal Lightbox con icono de carrito */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center"
          onClick={closeModal}
        >
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {/* Botón cerrar */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
            >
              <X size={24} />
            </button>

            {/* Botón anterior */}
            {displayImages.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-4 z-10 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
              >
                <ChevronLeft size={32} />
              </button>
            )}

            {/* Imagen ampliada */}
            <div className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center">
              <img
                src={displayImages[modalIndex]}
                alt={productName}
                className="max-w-full max-h-[90vh] object-contain"
                onClick={(e) => e.stopPropagation()}
              />
              
              {/* Icono de carrito en la imagen ampliada - SIEMPRE VISIBLE */}
              {productId && productPrecio && (
                <button
                  onClick={handleAddToCart}
                  className="absolute bottom-6 right-6 z-20 flex items-center justify-center w-14 h-14 rounded-full bg-green-500 text-white hover:bg-green-600 hover:scale-110 transition-all duration-300 shadow-2xl"
                  style={{ backgroundColor: "#22c55e" }}
                  title="Añadir al carrito"
                >
                  {addedToCart ? <Check size={24} /> : <ShoppingCart size={24} />}
                </button>
              )}
            </div>

            {/* Contador de imágenes */}
            {displayImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {modalIndex + 1} / {displayImages.length}
              </div>
            )}

            {/* Botón siguiente */}
            {displayImages.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-4 z-10 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
              >
                <ChevronRight size={32} />
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ProductImageGallery;