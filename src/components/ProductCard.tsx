import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";

interface ProductCardProps {
  id: string;
  nombre: string;
  precio: number;
  imagenes: string[];
  masVendido?: boolean;
  nuevo?: boolean;
  rebaja?: boolean;
  descuento?: number;
}

const ProductCard = ({ id, nombre, precio, imagenes, masVendido, nuevo, rebaja, descuento }: ProductCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const precioFinal = descuento ? precio * (1 - descuento / 100) : precio;
  
  // Determinar la URL de la imagen
  const imagenUrl = !imageError && imagenes && imagenes.length > 0 
    ? imagenes[0] 
    : null;

  const placeholderUrl = `https://placehold.co/600x400/2a2a2a/2ecc71?text=${encodeURIComponent(nombre)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <Link
        to={`/producto/${id}`}
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
            alt={nombre}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            loading="lazy"
            onLoad={() => {
              console.log(`✅ Imagen cargada: ${nombre}`);
              setImageLoaded(true);
            }}
            onError={(e) => {
              console.error(`❌ Error cargando imagen: ${nombre}`);
              setImageError(true);
              setImageLoaded(true);
              e.currentTarget.src = placeholderUrl;
            }}
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {nuevo && (
              <span className="bg-primary text-primary-foreground text-[10px] font-display tracking-widest px-2 py-1 rounded-sm uppercase">
                NEW
              </span>
            )}
            {descuento ? (
              <span className="bg-destructive text-destructive-foreground text-[10px] font-display tracking-widest px-2 py-1 rounded-sm uppercase">
                -{descuento}%
              </span>
            ) : rebaja && (
              <span className="bg-destructive text-destructive-foreground text-[10px] font-display tracking-widest px-2 py-1 rounded-sm uppercase">
                SALE
              </span>
            )}
            {masVendido && (
              <span className="bg-foreground text-background text-[10px] font-display tracking-widest px-2 py-1 rounded-sm uppercase">
                TOP
              </span>
            )}
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-display text-sm tracking-wide text-foreground truncate">{nombre}</h3>
          <div className="flex items-center gap-2 mt-1">
            {descuento ? (
              <>
                <p className="text-primary font-bold text-lg">{precioFinal.toFixed(0)}€</p>
                <p className="text-muted-foreground line-through text-sm">{precio}€</p>
              </>
            ) : (
              <p className="text-primary font-bold text-lg">{precio}€</p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;