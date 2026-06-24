import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom"; // AÑADIDO Link
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebase/config";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowLeft, Baby } from "lucide-react";
import { motion } from "framer-motion";

interface Producto {
  id: string;
  nombre: string;
  precio: number;
  categoria: string;
  descripcion: string;
  imagenes: string[];
  masVendido?: boolean;
  nuevo?: boolean;
  rebaja?: boolean;
  especificaciones: {
    autonomia?: string;
    peso?: string;
    plegable?: boolean;
    edadRecomendada?: string;
    velocidadMaxima?: string;
    bateria?: string;
    tiempoCarga?: string;
    colores?: string[];
  };
}

// Componente de tarjeta para productos infantiles - CORREGIDO con Link
const InfantilCard = ({ producto }: { producto: Producto }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const imagenUrl = !imageError && producto.imagenes && producto.imagenes.length > 0        
    ? producto.imagenes[0]
    : null;

  const placeholderUrl = `https://placehold.co/600x400/2a2a2a/2ecc71?text=${encodeURIComponent(producto.nombre)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      {/* CAMBIADO: div por Link */}
      <Link
        to={`/producto/${producto.id}`}
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
            alt={producto.nombre}
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

          {/* Badge de nuevo si aplica */}
          {producto.nuevo && (
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              <span className="bg-primary text-primary-foreground text-[10px] font-display tracking-widest px-2 py-1 rounded-sm uppercase">
                NUEVO
              </span>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-display text-sm tracking-wide text-foreground truncate">{producto.nombre}</h3>
          <p className="text-primary font-bold text-lg mt-1">{producto.precio}€</p>       

          {/* Especificaciones rápidas */}
          <div className="mt-2 text-xs text-muted-foreground space-y-1">
            {producto.especificaciones?.edadRecomendada && (
              <p>Edad: {producto.especificaciones.edadRecomendada}</p>
            )}
            {producto.especificaciones?.velocidadMaxima && (
              <p>Velocidad: {producto.especificaciones.velocidadMaxima}</p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const CategoriaInfantil = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    setLoading(true);
    try {
      // ✅ LEE DE LA COLECCIÓN "productos" CON CATEGORÍA "infantiles"
      const q = query(collection(db, "productos"), where("categoria", "==", "infantiles")); 
      const snap = await getDocs(q);
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as Producto));
      setProductos(items);
    } catch (error) {
      console.error("Error cargando productos infantiles:", error);
    }
    setLoading(false);
  };

  const goBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando productos infantiles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        {/* Botón Volver */}
        <button
          onClick={goBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-display tracking-widest">VOLVER</span>
        </button>

        {/* Título con icono */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
            <Baby size={20} className="text-primary" />
          </div>
          <h1 className="font-display font-bold text-3xl md:text-4xl tracking-tight text-foreground">
            Línea Infantil
          </h1>
        </div>

        {productos.length === 0 ? (
          <div className="text-center py-20">
            <Baby size={48} className="text-muted-foreground mx-auto mb-4 opacity-50" />    
            <p className="text-muted-foreground text-lg">Próximamente productos infantiles</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">   
            {productos.map((producto) => (
              <InfantilCard key={producto.id} producto={producto} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriaInfantil;