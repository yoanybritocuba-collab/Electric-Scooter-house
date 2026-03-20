import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { Star, Sparkles, Percent, ShoppingCart, Check } from "lucide-react";

interface ProductCardProps {
  id: string;
  nombre: string;
  nombre_en?: string;
  nombre_gr?: string;
  precio: number;
  imagenes: string[];
  masVendido?: boolean;
  nuevo?: boolean;
  rebaja?: boolean;
  descuento?: number;
}

const ProductCard = ({
  id,
  nombre,
  nombre_en,
  nombre_gr,
  precio,
  imagenes,
  masVendido,
  nuevo,
  rebaja,
  descuento,
}: ProductCardProps) => {
  const { lang } = useLanguage();
  const { addItem } = useCart();
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const getNombre = () => {
    if (lang === 'en' && nombre_en) return nombre_en;
    if (lang === 'gr' && nombre_gr) return nombre_gr;
    return nombre;
  };

  const imagenUrl = imagenes && imagenes.length > 0 && !imageError 
    ? imagenes[0] 
    : null;
  
  const placeholderUrl = `https://placehold.co/600x400/2a2a2a/2ecc71?text=${encodeURIComponent(getNombre() || "Producto")}`;
  
  const finalImageUrl = imagenUrl || placeholderUrl;

  const precioFinal = descuento ? precio * (1 - descuento / 100) : precio;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log("🛒 AÑADIENDO AL CARRITO:", { id, nombre, precio: precioFinal });
    
    addItem({
      id,
      nombre,
      nombre_en,
      nombre_gr,
      precio: precioFinal,
      imagen: imagenes?.[0] || placeholderUrl
    });
    
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1500);
  };

  return (
    <div className="group relative bg-gray-900 rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
      {/* Contenedor de la imagen con posición relativa */}
      <div className="relative">
        {/* Link a detalle - solo la imagen */}
        <Link to={`/producto/${id}`} className="block aspect-square overflow-hidden bg-gray-800">
          <img
            src={finalImageUrl}
            alt={getNombre()}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              console.log("❌ Error cargando imagen:", imagenUrl);
              setImageError(true);
              setImageLoaded(true);
            }}
          />
          {!imageLoaded && (
            <div className="w-full h-full flex items-center justify-center bg-gray-800">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </Link>

        {/* Badges - esquina superior izquierda (funciona en mobile) */}
        <div className="absolute top-2 left-2 z-10 flex flex-wrap gap-1 max-w-[70%]">
          {masVendido && (
            <span className="bg-primary text-white text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex items-center gap-0.5 sm:gap-1">
              <Star size={10} className="sm:w-3 sm:h-3" /> 
              <span className="hidden sm:inline">TOP</span>
            </span>
          )}
          {nuevo && (
            <span className="bg-green-500 text-white text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex items-center gap-0.5 sm:gap-1">
              <Sparkles size={10} className="sm:w-3 sm:h-3" /> 
              <span className="hidden sm:inline">NUEVO</span>
            </span>
          )}
          {rebaja && descuento && (
            <span className="bg-red-500 text-white text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex items-center gap-0.5 sm:gap-1">
              <Percent size={10} className="sm:w-3 sm:h-3" /> 
              <span className="hidden sm:inline">-{descuento}%</span>
            </span>
          )}
        </div>

        {/* Icono de carrito - esquina inferior derecha (bien posicionado en mobile) */}
        <button
          onClick={handleAddToCart}
          className="absolute bottom-2 right-2 z-20 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-500 text-white hover:bg-green-600 hover:scale-110 transition-all duration-300 shadow-lg"
          style={{ backgroundColor: "#22c55e" }}
          title="Añadir al carrito"
        >
          {addedToCart ? <Check size={14} className="sm:w-4 sm:h-4" /> : <ShoppingCart size={14} className="sm:w-4 sm:h-4" />}
        </button>
      </div>

      {/* Información del producto */}
      <div className="p-2 sm:p-4">
        <Link to={`/producto/${id}`} className="block">
          <h3 className="font-display font-bold text-white text-sm sm:text-lg mb-1 sm:mb-2 line-clamp-2 hover:text-primary transition-colors">
            {getNombre()}
          </h3>
        </Link>
        <div className="flex items-center gap-1 sm:gap-2 mt-1 sm:mt-2">
          <span className="text-primary font-bold text-base sm:text-xl">{precioFinal.toFixed(2)}€</span>
          {descuento && (
            <span className="text-gray-500 line-through text-xs sm:text-sm">{precio}€</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;