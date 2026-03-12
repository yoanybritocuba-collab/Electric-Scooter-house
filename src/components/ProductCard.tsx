import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ProductCardProps {
  id: string;
  nombre: string;      // Español (obligatorio)
  nombre_en?: string;  // Inglés (opcional)
  nombre_gr?: string;  // Griego (opcional)
  precio: number;
  imagenes: string[];
  masVendido?: boolean;
  nuevo?: boolean;
  rebaja?: boolean;
  descuento?: number;
}

const ProductCard = (props: ProductCardProps) => {
  const { lang } = useLanguage();
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const precioFinal = props.descuento ? props.precio * (1 - props.descuento / 100) : props.precio;
  
  // Función para obtener el nombre según el idioma
  const getNombre = (): string => {
    // Si el idioma es inglés y existe nombre_en, úsalo
    if (lang === 'en' && props.nombre_en) {
      return props.nombre_en;
    }
    // Si el idioma es griego y existe nombre_gr, úsalo
    if (lang === 'gr' && props.nombre_gr) {
      return props.nombre_gr;
    }
    // Por defecto, usar español
    return props.nombre;
  };
  
  // Determinar la URL de la imagen
  const imagenUrl = !imageError && props.imagenes && props.imagenes.length > 0 
    ? props.imagenes[0] 
    : null;

  const placeholderUrl = `https://placehold.co/600x400/2a2a2a/2ecc71?text=${encodeURIComponent(getNombre())}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <Link
        to={`/producto/${props.id}`}
        className="group block glow-border rounded-lg overflow-hidden bg-card hover-lift"
      >
        <div className="relative aspect-square overflow-hidden bg-secondary">
          {/* Loader mientras carga */}
          {!imageLoaded && imagenUrl && (
            <div className="absolute inset-0 flex items-center justify-center bg-secondary">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          
          <img
            src={imagenUrl || placeholderUrl}
            alt={getNombre()}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            loading="lazy"
            onLoad={() => {
              console.log(`✅ Imagen cargada: ${getNombre()}`);
              setImageLoaded(true);
            }}
            onError={(e) => {
              console.error(`❌ Error cargando imagen: ${getNombre()}`);
              setImageError(true);
              setImageLoaded(true);
              e.currentTarget.src = placeholderUrl;
            }}
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {props.nuevo && (
              <span className="bg-primary text-primary-foreground text-[10px] font-display tracking-widest px-2 py-1 rounded-sm uppercase">
                NEW
              </span>
            )}
            {props.descuento ? (
              <span className="bg-destructive text-destructive-foreground text-[10px] font-display tracking-widest px-2 py-1 rounded-sm uppercase">
                -{props.descuento}%
              </span>
            ) : props.rebaja && (
              <span className="bg-destructive text-destructive-foreground text-[10px] font-display tracking-widest px-2 py-1 rounded-sm uppercase">
                SALE
              </span>
            )}
            {props.masVendido && (
              <span className="bg-foreground text-background text-[10px] font-display tracking-widest px-2 py-1 rounded-sm uppercase">
                TOP
              </span>
            )}
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-display text-sm tracking-wide text-foreground truncate">
            {getNombre()}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            {props.descuento ? (
              <>
                <p className="text-primary font-bold text-lg">{precioFinal.toFixed(0)}€</p>
                <p className="text-muted-foreground line-through text-sm">{props.precio}€</p>
              </>
            ) : (
              <p className="text-primary font-bold text-lg">{props.precio}€</p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;