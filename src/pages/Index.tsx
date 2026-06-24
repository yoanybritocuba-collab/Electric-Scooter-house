import { useState, useEffect } from "react";
import { collection, getDocs, doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/config";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link, useLocation } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import CategoryCard from "@/components/CategoryCard";
import MobileBottomBar from "@/components/MobileBottomBar";
import ViberButton from "@/components/ViberAppButton";
import MainSlider from "@/components/MainSlider";
import MobileHero from "@/components/MobileHero";
import { motion } from "framer-motion";
import { 
  Star, Percent, Baby, Accessibility, Sparkles,
  Gauge, Bike, Wrench, Settings, Package,
  Battery, Plug, Shield
} from "lucide-react";

// ========== ÍCONO DE MOTO ==========
const MotorcycleIcon = ({ size = 16, className = "", style }: { size?: number; className?: string; style?: React.CSSProperties }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
  >
    <circle cx="6" cy="16" r="3" fill="none" />
    <circle cx="18" cy="16" r="3" fill="none" />
    <path d="M6 16h12" />
    <path d="M12 6v10" />
    <path d="M8 10h8" />
    <rect x="10" y="8" width="4" height="4" rx="1" fill="none" />
    <path d="M7 10L5 12" />
    <path d="M17 10L19 12" />
    <path d="M8 13h8" strokeWidth="1.5" />
  </svg>
);

const categoryIcons: Record<string, any> = {
  patinetes: Gauge,
  bicicletas: Bike,
  motos: MotorcycleIcon,
  accesorios: Wrench,
  piezas: Settings,
  infantiles: Baby,
  "movilidad-reducida": Accessibility,
  baterias: Battery,
  cargadores: Plug,
  cascos: Shield,
};

interface Product {
  id: string;
  nombre: string;
  nombre_en?: string;
  nombre_gr?: string;
  precio: number;
  categoria: string;
  imagenes: string[];
  masVendido?: boolean;
  nuevo?: boolean;
  rebaja?: boolean;
  descuento?: number;
  variantes?: any[];
  variantesUnificadas?: any[];
  opciones?: {
    voltajes?: any[];
    potencias?: any[];
    colores?: any[];
  };
}

interface Categoria {
  id: string;
  nombre: string;
  nombre_en?: string;
  nombre_gr?: string;
  descripcion: string;
  imagen: string;
  orden: number;
  activo: boolean;
}

interface OfertaConfig {
  [productId: string]: {
    activo: boolean;
    descuento: number;
  };
}

const Index = () => {
  const { t, lang } = useLanguage();
  const location = useLocation();
  const [products, setProducts] = useState<Product[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [masVendidos, setMasVendidos] = useState<string[]>([]);
  const [ofertas, setOfertas] = useState<OfertaConfig>({});
  const [nuevosIds, setNuevosIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const getText = (es: string, en: string, gr: string) => {
    if (lang === 'en') return en;
    if (lang === 'gr') return gr;
    return es;
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getNombreCategoria = (cat: Categoria): string => {
    if (lang === 'en' && cat.nombre_en) return cat.nombre_en;
    if (lang === 'gr' && cat.nombre_gr) return cat.nombre_gr;
    return cat.nombre;
  };

  // ✅ FUNCIÓN MEJORADA PARA OBTENER IMAGEN DE CATEGORÍA
  const getCategoryImage = (categoriaId: string): string | null => {
    const productsInCategory = products.filter(p => 
      p.categoria?.toLowerCase() === categoriaId?.toLowerCase()
    );
    
    for (const product of productsInCategory) {
      // 1. Buscar en opciones.colores
      if (product.opciones?.colores && product.opciones.colores.length > 0) {
        const primerColor = product.opciones.colores[0];
        if (primerColor.imagenes && primerColor.imagenes.length > 0) {
          return primerColor.imagenes[0];
        }
      }
      // 2. Buscar en variantesUnificadas
      if (product.variantesUnificadas && product.variantesUnificadas.length > 0) {
        const primeraVariante = product.variantesUnificadas[0];
        if (primeraVariante?.imagen && !primeraVariante.imagen.includes("placehold.co")) {
          return primeraVariante.imagen;
        }
      }
      // 3. Buscar en imágenes generales
      if (product.imagenes && product.imagenes.length > 0 && product.imagenes[0]) {
        return product.imagenes[0];
      }
    }
    return null;
  };

  // Escucha en tiempo real
  useEffect(() => {
    const unsubscribeProducts = onSnapshot(collection(db, "productos"), (snapshot) => {
      const productos = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
      setProducts(productos);
      console.log(`✅ Productos actualizados en tiempo real: ${productos.length}`);
      setLoading(false);
    }, (error) => {
      console.error("❌ Error en tiempo real productos:", error);
      setLoading(false);
    });

    const unsubscribeCategorias = onSnapshot(collection(db, "categorias"), (snapshot) => {
      const cats = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Categoria));
      if (cats.length === 0) {
        const defaultCats = [
          { id: "patinetes", nombre: "Patinetes Eléctricos", imagen: "", orden: 1, activo: true, descripcion: "" },
          { id: "bicicletas", nombre: "Bicicletas Eléctricas", imagen: "", orden: 2, activo: true, descripcion: "" },
          { id: "motos", nombre: "Motos Eléctricas", imagen: "", orden: 3, activo: true, descripcion: "" },
          { id: "accesorios", nombre: "Accesorios", imagen: "", orden: 4, activo: true, descripcion: "" },
          { id: "piezas", nombre: "Piezas y Repuestos", imagen: "", orden: 5, activo: true, descripcion: "" },
          { id: "infantiles", nombre: "Línea Infantil", imagen: "", orden: 6, activo: true, descripcion: "" },
          { id: "movilidad-reducida", nombre: "Movilidad Reducida", imagen: "", orden: 7, activo: true, descripcion: "" },
        ];
        setCategorias(defaultCats);
      } else {
        setCategorias(cats.sort((a, b) => a.orden - b.orden));
      }
    });

    const unsubscribeConfig = onSnapshot(collection(db, "configuracion"), (snapshot) => {
      const masVendidosConfig = snapshot.docs.find(d => d.id === "masVendidos");
      if (masVendidosConfig?.exists()) {
        setMasVendidos(masVendidosConfig.data().productos || []);
      }

      const ofertasConfig = snapshot.docs.find(d => d.id === "ofertas");
      if (ofertasConfig?.exists()) {
        const data = ofertasConfig.data();
        setOfertas(data.productos || data);
      }

      const nuevosConfig = snapshot.docs.find(d => d.id === "nuevos");
      if (nuevosConfig?.exists()) {
        const nuevosData = nuevosConfig.data().productos || {};
        const ahora = new Date();
        ahora.setHours(0, 0, 0, 0);
        
        const activos = Object.keys(nuevosData).filter(id => {
          const prod = nuevosData[id];
          if (!prod.activo) return false;
          
          let inicio, fin;
          if (prod.fechaInicio?.toDate) {
            inicio = prod.fechaInicio.toDate();
          } else if (prod.fechaInicio) {
            inicio = new Date(prod.fechaInicio);
          } else {
            return false;
          }
          
          if (prod.fechaFin?.toDate) {
            fin = prod.fechaFin.toDate();
          } else if (prod.fechaFin) {
            fin = new Date(prod.fechaFin);
          } else {
            return false;
          }
          
          inicio.setHours(0, 0, 0, 0);
          fin.setHours(23, 59, 59, 999);
          
          return inicio <= ahora && fin >= ahora;
        });
        
        console.log("✅ Productos nuevos activos:", activos);
        setNuevosIds(activos);
      }
    });

    return () => {
      unsubscribeProducts();
      unsubscribeCategorias();
      unsubscribeConfig();
    };
  }, []);

  // Restaurar scroll
  useEffect(() => {
    const savedScroll = sessionStorage.getItem('homeScrollPosition');
    if (savedScroll && !loading) {
      const scrollPos = parseInt(savedScroll);
      console.log("🔄 [Index] Restaurando scroll a:", scrollPos);
      
      setTimeout(() => {
        window.scrollTo(0, scrollPos);
        sessionStorage.removeItem('homeScrollPosition');
        console.log("✅ Scroll restaurado a:", window.scrollY);
      }, 150);
    }
  }, [loading]);

  const categories = categorias.filter(c => c.activo);
  
  const masVendidosList = products.filter(p => 
    masVendidos.includes(p.id) && p.id !== "aPMG8JBnCm9cRsLNnFJ6"
  );
  
  const ofertasList = products.filter(p => 
    ofertas[p.id]?.activo && p.id !== "aPMG8JBnCm9cRsLNnFJ6"
  );
  
  const nuevosList = products.filter(p => 
    nuevosIds.includes(p.id) && p.id !== "aPMG8JBnCm9cRsLNnFJ6"
  );

  const handleProductClick = (productId: string) => {
    const scrollPosition = window.scrollY;
    console.log("📌 [Index] Guardando scroll:", scrollPosition);
    sessionStorage.setItem('homeScrollPosition', scrollPosition.toString());
  };

  // Función para verificar si una categoría tiene productos en oferta
  const getCategoryBadges = (categoriaId: string) => {
    const productsInCategory = products.filter(p => p.categoria?.toLowerCase() === categoriaId?.toLowerCase());
    
    const tieneTop = productsInCategory.some(p => p.masVendido === true);
    const tieneNuevo = productsInCategory.some(p => p.nuevo === true);
    const tieneOferta = productsInCategory.some(p => p.rebaja === true && p.descuento && p.descuento > 0);
    const descuento = productsInCategory.find(p => p.rebaja === true)?.descuento || 0;
    
    return { tieneTop, tieneNuevo, tieneOferta, descuento };
  };

  const Section = ({ titleKey, icon: Icon, items }: { titleKey: string; icon?: any; items: Product[] }) => {
    if (items.length === 0) return null;
    
    const title = t(`home.${titleKey}`);
    
    return (
      <section className="py-16">
        <div className="flex items-center gap-3 mb-8">
          {Icon && <Icon size={24} className="text-green-500" />}
          <h2 className="font-display font-bold text-2xl md:text-3xl tracking-tight text-white">
            {title}
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">     
          {items.slice(0, 4).map((p) => (
            <div 
              key={p.id}
              onClick={() => handleProductClick(p.id)}
              className="cursor-pointer"
            >
              <ProductCard
                id={p.id}
                nombre={p.nombre}
                nombre_en={p.nombre_en}
                nombre_gr={p.nombre_gr}
                precio={p.precio}
                imagenes={p.imagenes}
                masVendido={p.masVendido}
                nuevo={p.nuevo}
                rebaja={p.rebaja}
                descuento={ofertas[p.id]?.descuento || p.descuento}
                tieneColores={p.opciones?.colores?.length > 0 || (p.variantes && p.variantes.length > 0)}
                colores={p.opciones?.colores || p.variantes || []}
                variantesUnificadas={p.variantesUnificadas || []}
                opciones={p.opciones}
              />
            </div>
          ))}
        </div>
      </section>
    );
  };

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">{t("messages.loading") || "Cargando..."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {isMobile ? <MobileHero /> : <MainSlider />}

      <div className="relative z-10 bg-black">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          {/* SECCIÓN DE CATEGORÍAS */}
          <section className="py-16">
            <h2 className="font-display font-bold text-2xl md:text-3xl tracking-tight text-white mb-8">
              {t("home.categories") || "Categorías"}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {categories.map((cat) => {
                const Icon = categoryIcons[cat.id] || Package;
                const nombreCategoria = getNombreCategoria(cat);
                const categoryImage = getCategoryImage(cat.id);
                const productCount = products.filter(p => p.categoria?.toLowerCase() === cat.id?.toLowerCase()).length;
                const { tieneTop, tieneNuevo, tieneOferta, descuento } = getCategoryBadges(cat.id);

                return (
                  <CategoryCard
                    key={cat.id}
                    id={cat.id}
                    nombre={nombreCategoria}
                    nombre_en={cat.nombre_en}
                    nombre_gr={cat.nombre_gr}
                    imageUrl={categoryImage}
                    productCount={productCount}
                    icon={Icon}
                    tieneTop={tieneTop}
                    tieneNuevo={tieneNuevo}
                    tieneOferta={tieneOferta}
                    descuento={descuento}
                  />
                );
              })}
            </div>
          </section>

          {masVendidosList.length > 0 && (
            <Section titleKey="featured" icon={Star} items={masVendidosList} />
          )}

          {ofertasList.length > 0 && (
            <Section titleKey="offers" icon={Percent} items={ofertasList} />
          )}

          {nuevosList.length > 0 && (
            <Section titleKey="new" icon={Sparkles} items={nuevosList} />
          )}
        </div>
      </div>
      
      <MobileBottomBar />
      <ViberButton />
    </div>
  );
};

export default Index;