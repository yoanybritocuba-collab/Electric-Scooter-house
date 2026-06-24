import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { Eye, Star, Sparkles, Percent } from "lucide-react";
import { useState } from "react";

interface CategoryCardProps {
  id: string;
  nombre: string;
  nombre_en?: string;
  nombre_gr?: string;
  imageUrl: string | null;
  productCount: number;
  icon: any;
  tieneOferta?: boolean;
  tieneNuevo?: boolean;
  tieneTop?: boolean;
  descuento?: number;
}

const CategoryCard = ({ 
  id, 
  nombre, 
  nombre_en, 
  nombre_gr, 
  imageUrl, 
  productCount, 
  icon: Icon,
  tieneOferta = false,
  tieneNuevo = false,
  tieneTop = false,
  descuento = 0
}: CategoryCardProps) => {
  const { lang } = useLanguage();
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

  return (
    <Link to={`/categoria/${id}`} className="block group">
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className="relative bg-gradient-to-b from-gray-900 to-black rounded-xl overflow-hidden border border-gray-800 hover:border-green-500/70 transition-all duration-300 shadow-lg hover:shadow-green-500/30 hover:shadow-xl"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Contenedor de imagen */}
        <div className="relative aspect-square overflow-hidden bg-black">
          {imageUrl ? (
            <>
              <img
                src={imageUrl}
                alt={getNombre()}
                className={`w-full h-full object-cover transition-all duration-500 ${
                  isHovered ? 'scale-105' : 'scale-100'
                }`}
                loading="lazy"
              />
              {/* EFECTO CORTINA */}
              <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent transition-opacity duration-300 ${
                isHovered ? 'opacity-0' : 'opacity-100'
              }`} />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex flex-col items-center justify-center">
              <Icon size={48} className="text-gray-600" />
              <p className="text-gray-500 text-xs mt-2">{getText("Sin productos", "No products", "Δεν υπάρχουν προϊόντα")}</p>
            </div>
          )}

          {/* BADGES - PEQUEÑOS como en ProductCard */}
          {(tieneTop || tieneNuevo || tieneOferta) && (
            <div className="absolute top-2 left-2 z-10 flex gap-1">
              {tieneTop && (
                <span className="bg-gradient-to-r from-yellow-500 to-amber-500 text-black text-[8px] sm:text-[10px] font-bold px-1 sm:px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-lg">
                  <Star size={8} className="sm:w-[9px] sm:h-[9px]" /> 
                  <span className="hidden sm:inline">TOP</span>
                </span>
              )}
              {tieneNuevo && (
                <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-[8px] sm:text-[10px] font-bold px-1 sm:px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-lg">
                  <Sparkles size={8} className="sm:w-[9px] sm:h-[9px]" /> 
                  <span className="hidden sm:inline">NUEVO</span>
                </span>
              )}
              {tieneOferta && descuento > 0 && (
                <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-[8px] sm:text-[10px] font-bold px-1 sm:px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-lg">
                  <Percent size={8} className="sm:w-[9px] sm:h-[9px]" /> 
                  -{descuento}%
                </span>
              )}
            </div>
          )}

          {/* Botón VER */}
          <div className={`absolute inset-0 z-15 flex items-center justify-center transition-all duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}>
            <div className="bg-green-500 text-black px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 shadow-lg transform transition-transform duration-300 hover:scale-105">
              <Eye size={14} className="sm:w-4 sm:h-4" />
              {getText("VER", "VIEW", "ΔΕΣ")}
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-3 sm:p-4">
          <h3 className="font-bold text-white text-sm sm:text-base line-clamp-1 group-hover:text-green-500 transition-colors">
            {getNombre()}
          </h3>
          {productCount > 0 ? (
            <p className="text-gray-400 text-xs sm:text-sm mt-1">
              {productCount} {getText("productos", "products", "προϊόντα")}
            </p>
          ) : (
            <p className="text-orange-500 text-xs sm:text-sm mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              {getText("Próximamente", "Coming soon", "Σύντομα")}
            </p>
          )}
        </div>

        {/* Borde iluminado */}
        <div className="absolute inset-0 pointer-events-none rounded-xl border-2 border-transparent group-hover:border-green-500/50 transition-all duration-300" />
        
        {/* Línea decorativa */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </motion.div>
    </Link>
  );
};

export default CategoryCard;