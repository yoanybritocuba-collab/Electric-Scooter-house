import { useState, useEffect, useMemo } from "react";
import { collection, getDocs, query, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/config";
import { useLanguage } from "@/contexts/LanguageContext";
import ProductCard from "@/components/ProductCard";
import CategoryCard from "@/components/CategoryCard";
import MobileBottomBar from "@/components/MobileBottomBar";
import ViberButton from "@/components/ViberAppButton";
import MainSlider from "@/components/MainSlider";
import MobileHero from "@/components/MobileHero";
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
  const [products, setProducts] = useState<Product[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [masVendidos, setMasVendidos] = useState<string[]>([]);
  const [ofertas, setOfertas] = useState<OfertaConfig>({});
  const [nuevosIds, setNuevosIds] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);

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

  // 🔥 FUNCIÓN PARA OBTENER IMAGEN DE CATEGORÍA (RECUPERADA)
  const getCategoryImage = (categoriaId: string): string | null => {
    const productsInCategory = products.filter(p => 
      p.categoria?.toLowerCase() === categoriaId?.toLowerCase()
    );
    
    for (const product of productsInCategory) {
      if (product.opciones?.colores && product.opciones.colores.length > 0) {
        const primerColor = product.opciones.colores[0];
        if (primerColor.imagenes && primerColor.imagenes.length > 0) {
          return primerColor.imagenes[0];
        }
      }
      if (product.variantesUnificadas && product.variantesUnificadas.length > 0) {
        const primeraVariante = product.variantesUnificadas[0];
        if (primeraVariante?.imagen && !primeraVariante.imagen.includes("placehold.co")) {
          return primeraVariante.imagen;
        }
      }
      if (product.imagenes && product.imagenes.length > 0 && product.imagenes[0]) {
        return product.imagenes[0];
      }
    }
    return null;
  };

  // 🔥 CARGAR PRODUCTOS
  const cargarProductos = async () => {
    try {
      const productsQuery = query(collection(db, "productos"), limit(30));
      const snapshot = await getDocs(productsQuery);
      const productos = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
      setProducts(productos);
      console.log(`✅ Productos cargados: ${productos.length}`);
    } catch (error) {
      console.error("❌ Error cargando productos:", error);
    }
  };

  // 🔥 CARGAR CATEGORÍAS
  const cargarCategorias = async () => {
    try {
      const snapshot = await getDocs(collection(db, "categorias"));
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
    } catch (error) {
      console.error("❌ Error cargando categorías:", error);
    }
  };

  // 🔥 CARGAR CONFIGURACIÓN
  const cargarConfiguracion = async () => {
    try {
      const snapshot = await getDocs(collection(db, "configuracion"));
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (doc.id === "masVendidos") {
          setMasVendidos(data.productos || []);
        } else if (doc.id === "ofertas") {
          setOfertas(data.productos || data);
        } else if (doc.id === "nuevos") {
          const nuevosData = data.productos || {};
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
    } catch (error) {
      console.error("❌ Error cargando configuración:", error);
    }
  };

  // 🔥 CARGAR TODOS LOS DATOS
  useEffect(() => {
    const cargarTodo = async () => {
      setLoading(true);
      await Promise.all([
        cargarProductos(),
        cargarCategorias(),
        cargarConfiguracion()
      ]);
      setLoading(false);
    };
    
    cargarTodo();
  }, []);

  // 🔥 LISTENER PARA TIEMPO REAL
  useEffect(() => {
    if (products.length === 0) return;
    
    const unsubscribe = onSnapshot(
      query(collection(db, "productos"), limit(30)),
      (snapshot) => {
        const productos = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
        setProducts(productos);
        console.log(`✅ Productos actualizados en tiempo real: ${productos.length}`);
      },
      (error) => {
        console.error("❌ Error en tiempo real productos:", error);
      }
    );
    
    return () => unsubscribe();
  }, []);

  const categories = useMemo(() => categorias.filter(c => c.activo), [categorias]);
  
  // 🔥 CONTADOR DE PRODUCTOS POR CATEGORÍA (ACTUALIZADO EN TIEMPO REAL)
  const productCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    categories.forEach(cat => {
      counts[cat.id] = products.filter(p => p.categoria?.toLowerCase() === cat.id?.toLowerCase()).length;
    });
    return counts;
  }, [products, categories]);
  
  const masVendidosList = useMemo(() => 
    products.filter(p => masVendidos.includes(p.id) && p.id !== "aPMG8JBnCm9cRsLNnFJ6"),
    [products, masVendidos]
  );
  
  const ofertasList = useMemo(() => 
    products.filter(p => ofertas[p.id]?.activo && p.id !== "aPMG8JBnCm9cRsLNnFJ6"),
    [products, ofertas]
  );
  
  const nuevosList = useMemo(() => 
    products.filter(p => nuevosIds.includes(p.id) && p.id !== "aPMG8JBnCm9cRsLNnFJ6"),
    [products, nuevosIds]
  );

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
            <div key={p.id} className="cursor-pointer">
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
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 text-sm">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {isMobile ? <MobileHero /> : <MainSlider />}

      <div className="relative z-10 bg-black">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <section className="py-16">
            <h2 className="font-display font-bold text-2xl md:text-3xl tracking-tight text-white mb-8">
              {t("home.categories") || "Categorías"}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {categories.map((cat) => {
                const Icon = categoryIcons[cat.id] || Package;
                const nombreCategoria = getNombreCategoria(cat);
                const categoryImage = getCategoryImage(cat.id);
                // 🔥 USO EL CONTADOR EN TIEMPO REAL
                const productCount = productCounts[cat.id] || 0;
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