import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { ShoppingCart } from "lucide-react";

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

const ProductCard = (props: ProductCardProps) => {
  const { lang } = useLanguage();
  const { addItem } = useCart();
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showAdded, setShowAdded] = useState(false);

  const precioFinal = props.descuento ? props.precio * (1 - props.descuento / 100) : props.precio;

  const getNombre = (): string => {
    if (lang === 'en' && props.nombre_en) return props.nombre_en;
    if (lang === 'gr' && props.nombre_gr) return props.nombre_gr;
    return props.nombre;
  };

  const getBadgeText = (badge: string): string => {
    if (lang === 'en') {
      if (badge === 'NEW') return 'NEW';
      if (badge === 'SALE') return 'SALE';
      if (badge === 'TOP') return 'TOP';
      return badge;
    }
    if (lang === 'gr') {
      if (badge === 'NEW') return 'ΝΕΟ';
      if (badge === 'SALE') return 'ΠΡΟΣΦΟΡΑ';
      if (badge === 'TOP') return 'ΚΟΡΥΦΑΙΟ';
      return badge;
    }
    return badge;
  };

  const imagenUrl = !imageError && props.imagenes && props.imagenes.length > 0
    ? props.imagenes[0]
    : null;
  const placeholderUrl = `https://placehold.co/600x400/2a2a2a/2ecc71?text=${encodeURIComponent(getNombre())}`;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: props.id,
      nombre: props.nombre,
      nombre_en: props.nombre_en,
      nombre_gr: props.nombre_gr,
      precio: precioFinal,
      imagen: props.imagenes?.[0] || placeholderUrl
    });
    setShowAdded(true);
    setTimeout(() => setShowAdded(false), 2000);
  };

  return (
    <div className="relative group cursor-pointer">
      <div className="block glow-border rounded-lg overflow-hidden bg-card hover-lift">
        <div className="relative aspect-square overflow-hidden bg-secondary">
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
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              setImageError(true);
              setImageLoaded(true);
              e.currentTarget.src = placeholderUrl;
            }}
          />
          {/* Badges con traducción */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {props.nuevo && (
              <span className="bg-primary text-primary-foreground text-[10px] font-display tracking-widest px-2 py-1 rounded-sm uppercase">
                {getBadgeText('NEW')}
              </span>
            )}
            {props.descuento ? (
              <span className="bg-destructive text-destructive-foreground text-[10px] font-display tracking-widest px-2 py-1 rounded-sm uppercase">
                -{props.descuento}%
              </span>
            ) : props.rebaja && (
              <span className="bg-destructive text-destructive-foreground text-[10px] font-display tracking-widest px-2 py-1 rounded-sm uppercase">
                {getBadgeText('SALE')}
              </span>
            )}
            {props.masVendido && (
              <span className="bg-foreground text-background text-[10px] font-display tracking-widest px-2 py-1 rounded-sm uppercase">
                {getBadgeText('TOP')}
              </span>
            )}
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-display text-sm tracking-wide text-foreground truncate">{getNombre()}</h3>
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-2">
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
        </div>
      </div>

      {/* Botón de carrito - AHORA SIEMPRE VISIBLE EN MÓVIL */}
      <button
        onClick={handleAddToCart}
        className="absolute bottom-4 right-4 w-10 h-10 bg-[#2ecc71] hover:bg-[#27ae60] text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 z-10 lg:opacity-0 lg:group-hover:opacity-100 focus:opacity-100"
        aria-label="Añadir al carrito"
      >
        <ShoppingCart size={18} />
      </button>
      {showAdded && (
        <div className="absolute top-2 right-2 bg-[#2ecc71] text-white text-xs px-2 py-1 rounded-full animate-pulse z-10">
          ✓ Añadido
        </div>
      )}
    </div>
  );
};
export default ProductCard;