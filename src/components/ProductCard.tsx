import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { Star, Sparkles, Percent, ShoppingCart, Check, Eye, Package } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";

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
  tieneColores?: boolean;
  colores?: any[];
  variantesUnificadas?: any[];
  opciones?: {
    voltajes?: any[];
    potencias?: any[];
    colores?: any[];
  };
  variantes?: any[];
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
  tieneColores,
  colores = [],
  variantesUnificadas = [],
  opciones,
  variantes = [],
}: ProductCardProps) => {
  const { lang } = useLanguage();
  const { addItem } = useCart();
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const getNombre = () => {
    if (lang === 'en' && nombre_en) return nombre_en;
    if (lang === 'gr' && nombre_gr) return nombre_gr;
    return nombre;
  };

  const getText = (es: string, en: string, gr: string) => {
    if (lang === 'en') return en;
    if (lang === 'gr') return gr;
    return es;
  };

  const getPrecioMostrado = (): number => {
    if (!precio) return 0;
    
    if (opciones) {
      let precioBase = precio;
      if (rebaja && descuento && descuento > 0) {
        precioBase = precio * (1 - descuento / 100);
      }
      if (opciones.voltajes && opciones.voltajes.length > 0) {
        precioBase += opciones.voltajes[0].precioExtra || 0;
      }
      if (opciones.potencias && opciones.potencias.length > 0) {
        precioBase += opciones.potencias[0].precioExtra || 0;
      }
      if (opciones.colores && opciones.colores.length > 0) {
        precioBase += opciones.colores[0].precioExtra || 0;
      }
      return precioBase;
    }
    if (rebaja && descuento && descuento > 0) {
      return precio * (1 - descuento / 100);
    }
    return precio;
  };

  const getImagenMostrada = (): string | null => {
    if (opciones?.colores && opciones.colores.length > 0) {
      const primerColor = opciones.colores[0];
      if (primerColor.imagenes && primerColor.imagenes.length > 0) {
        return primerColor.imagenes[0];
      }
    }
    if (variantes && variantes.length > 0) {
      const primeraVariante = variantes[0];
      if (primeraVariante.imagenes && primeraVariante.imagenes.length > 0) {
        return primeraVariante.imagenes[0];
      }
    }
    if (variantesUnificadas && variantesUnificadas.length > 0) {
      const primeraVariante = variantesUnificadas[0];
      if (primeraVariante?.imagen && !primeraVariante.imagen.includes("placehold.co")) {
        return primeraVariante.imagen;
      }
    }
    if (imagenes && imagenes.length > 0 && !imageError && imagenes[0] && !imagenes[0].includes("placehold.co")) {
      return imagenes[0];
    }
    return null;
  };

  const getColoresMostrar = (): any[] => {
    if (opciones?.colores && Array.isArray(opciones.colores) && opciones.colores.length > 0) {
      const primerColor = opciones.colores[0];
      if (typeof primerColor === 'object' && primerColor !== null) {
        return opciones.colores;
      }
    }
    if (variantes && Array.isArray(variantes) && variantes.length > 0) {
      return variantes;
    }
    if (colores && Array.isArray(colores) && colores.length > 0) {
      return colores;
    }
    if (variantesUnificadas && Array.isArray(variantesUnificadas) && variantesUnificadas.length > 0) {
      return variantesUnificadas;
    }
    return [];
  };

  const precioFinal = getPrecioMostrado();
  const imagenUrl = getImagenMostrada();
  const tieneDescuento = rebaja && descuento && descuento > 0;

  const coloresMostrar = getColoresMostrar();
  const coloresUnicos = coloresMostrar.slice(0, 4);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem({
      id,
      nombre,
      nombre_en,
      nombre_gr,
      precio: precioFinal,
      imagen: imagenUrl || ""
    });
    
    setAddedToCart(true);
    toast({
      title: getText("¡Añadido!", "Added!", "Προστέθηκε!"),
      description: getNombre(),
      className: "bg-green-500 text-white",
      duration: 1500,
    });
    setTimeout(() => setAddedToCart(false), 1500);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group relative bg-gradient-to-b from-gray-900 to-black rounded-xl overflow-hidden border border-gray-800 hover:border-green-500/70 transition-all duration-300 shadow-lg hover:shadow-green-500/30 hover:shadow-xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/producto/${id}`} className="block w-full h-full">
        <div className="relative aspect-square overflow-hidden bg-black">
          {imagenUrl ? (
            <>
              <img
                src={imagenUrl}
                alt={getNombre()}
                className={`w-full h-full object-cover transition-all duration-500 ${
                  isHovered ? 'scale-105' : 'scale-100'
                }`}
                loading="lazy"
                onLoad={() => setImageLoaded(true)}
                onError={() => {
                  setImageError(true);
                  setImageLoaded(true);
                }}
              />
              <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent transition-opacity duration-300 ${
                isHovered ? 'opacity-0' : 'opacity-100'
              }`} />
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800">
              <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs text-gray-500 mt-1">{getText("Sin imagen", "No image", "Χωρίς εικόνα")}</span>
            </div>
          )}

          <div className="absolute top-2 left-2 z-10 flex gap-1 flex-wrap">
            {masVendido && (
              <span className="bg-gradient-to-r from-yellow-500 to-amber-500 text-black text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full flex items-center gap-0.5 sm:gap-1 shadow-lg">
                <Star size={8} className="sm:w-[10px] sm:h-[10px]" /> 
                <span className="hidden sm:inline">{getText("TOP", "TOP", "TOP")}</span>
                <span className="sm:hidden">⭐</span>
              </span>
            )}
            {nuevo && (
              <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full flex items-center gap-0.5 sm:gap-1 shadow-lg">
                <Sparkles size={8} className="sm:w-[10px] sm:h-[10px]" /> 
                <span className="hidden sm:inline">{getText("NUEVO", "NEW", "ΝΕΟ")}</span>
                <span className="sm:hidden">✨</span>
              </span>
            )}
            {tieneDescuento && (
              <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full flex items-center gap-0.5 sm:gap-1 shadow-lg">
                <Percent size={8} className="sm:w-[10px] sm:h-[10px]" /> 
                -{descuento}%
              </span>
            )}
            {coloresUnicos.length > 0 && (
              <span className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full flex items-center gap-0.5 sm:gap-1 shadow-lg">
                <Package size={8} className="sm:w-[10px] sm:h-[10px]" />
                <span className="hidden sm:inline">{getText("COLORES", "COLORS", "ΧΡΩΜΑΤΑ")}</span>
                <span className="sm:hidden">🎨</span>
              </span>
            )}
          </div>

          <div className={`absolute inset-0 z-15 flex items-center justify-center transition-all duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}>
            <div className="bg-green-500 text-black px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 shadow-lg transform transition-transform duration-300 hover:scale-105">
              <Eye size={14} className="sm:w-4 sm:h-4" />
              {getText("VER", "VIEW", "ΔΕΣ")}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            className={`absolute bottom-2 right-2 z-20 flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full transition-all duration-300 shadow-lg ${
              addedToCart 
                ? 'bg-green-500 text-white scale-110' 
                : 'bg-green-500 text-white hover:bg-green-600 opacity-0 group-hover:opacity-100'
            }`}
            title={getText("Añadir al carrito", "Add to cart", "Προσθήκη στο καλάθι")}
          >
            {addedToCart ? <Check size={10} className="sm:w-3.5 sm:h-3.5" /> : <ShoppingCart size={10} className="sm:w-3.5 sm:h-3.5" />}
          </button>
        </div>

        <div className="p-2 sm:p-3">
          <h3 className="font-bold text-white text-xs sm:text-sm line-clamp-2 hover:text-green-500 transition-colors">
            {getNombre()}
          </h3>
          
          <div className="flex items-center justify-between mt-1 sm:mt-2">
            <div className="flex items-baseline gap-1 sm:gap-1.5">
              {/* 🔒 CORREGIDO: Mostrar precio solo si es mayor que 0 */}
              {precioFinal > 0 ? (
                <span className="text-green-500 font-bold text-sm sm:text-base">
                  {precioFinal.toFixed(2)}€
                </span>
              ) : (
                <span className="text-gray-400 font-bold text-sm sm:text-base">
                  Consultar
                </span>
              )}
              {tieneDescuento && (
                <span className="text-gray-500 line-through text-[10px] sm:text-xs">
                  {precio}€
                </span>
              )}
            </div>
          </div>

          {/* 🎨 BOLITAS DE COLORES */}
          {coloresUnicos.length > 0 && (
            <div className="flex gap-0.5 sm:gap-1 mt-1 sm:mt-2 flex-wrap">
              {coloresUnicos.map((color, idx) => {
                const nombreColor = lang === 'en' 
                  ? color.nombre_en || color.colorNombreEn || color.nombre || 'Color'
                  : lang === 'gr' 
                    ? color.nombre_gr || color.colorNombreGr || color.nombre || 'Χρώμα'
                    : color.nombre || color.colorNombre || 'Color';
                
                const codigo = color.codigoColor || color.color || '#888';
                const stock = color.stock ?? 0;
                const isOutOfStock = stock === 0;
                
                return (
                  <div
                    key={idx}
                    className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full border ${
                      isOutOfStock ? 'border-red-500 opacity-40' : 'border-gray-600'
                    }`}
                    style={{ backgroundColor: isOutOfStock ? '#666' : codigo }}
                    title={`${nombreColor}${isOutOfStock ? ' (Agotado)' : ''}`}
                  />
                );
              })}
              {coloresUnicos.length > 4 && (
                <span className="text-[6px] sm:text-[7px] text-gray-500">+{coloresUnicos.length - 4}</span>
              )}
            </div>
          )}
        </div>

        <div className="absolute inset-0 pointer-events-none rounded-xl border-2 border-transparent group-hover:border-green-500/50 transition-all duration-300" />
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Link>
    </motion.div>
  );
};

export default ProductCard;