import { useState, useEffect } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link, useLocation } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import MobileBottomBar from "@/components/MobileBottomBar";
import ViberButton from "@/components/ViberAppButton";
import { motion } from "framer-motion";
import { 
  Zap, Bike, Car, Wrench, Settings, 
  Star, Percent, Baby, Accessibility, Sparkles,
  Gauge, Headphones, Package,
  Battery, Plug, Shield
} from "lucide-react";

const categoryIcons: Record<string, any> = {
  patinetes: Gauge,
  bicicletas: Bike,
  motos: Car,
  accesorios: Headphones,
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
  const [placeholderProduct, setPlaceholderProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [restored, setRestored] = useState(false);
  const [showFooter, setShowFooter] = useState(true);

  const getNombreCategoria = (cat: Categoria): string => {
    if (lang === 'en' && cat.nombre_en) return cat.nombre_en;
    if (lang === 'gr' && cat.nombre_gr) return cat.nombre_gr;
    return cat.nombre;
  };

  useEffect(() => {
    const loadPlaceholder = async () => {
      try {
        const placeholderDoc = await getDoc(doc(db, "productos", "aPMG8JBnCm9cRsLNnFJ6"));
        if (placeholderDoc.exists()) {
          setPlaceholderProduct({ id: placeholderDoc.id, ...placeholderDoc.data() } as Product);
        }
      } catch (error) {
        console.error("Error cargando placeholder:", error);
      }
    };
    loadPlaceholder();
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (restored) return;
    
    const savedScroll = sessionStorage.getItem('homeScrollPosition');
    if (savedScroll && !loading) {
      const scrollPos = parseInt(savedScroll);
      console.log("🔄 [Index] Restaurando scroll a:", scrollPos);
      
      setShowFooter(false);
      
      setTimeout(() => {
        window.scrollTo(0, scrollPos);
        sessionStorage.removeItem('homeScrollPosition');
        setRestored(true);
        console.log("✅ Scroll restaurado a:", window.scrollY);
        
        setTimeout(() => {
          setShowFooter(true);
        }, 1000);
      }, 300);
    }
  }, [loading, restored]);

  const loadData = async () => {
    setLoading(true);
    setRestored(false);
    try {
      console.log("========== 📦 CARGANDO DATOS EN INDEX ==========");
      
      const productSnap = await getDocs(collection(db, "productos"));
      const productos = productSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
      setProducts(productos);
      console.log(`✅ Productos cargados: ${productos.length}`);

      const catSnap = await getDocs(collection(db, "categorias"));
      const cats = catSnap.docs.map(d => ({ id: d.id, ...d.data() } as Categoria));

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

      const configSnap = await getDocs(collection(db, "configuracion"));
      
      const masVendidosConfig = configSnap.docs.find(d => d.id === "masVendidos");
      if (masVendidosConfig?.exists()) {
        setMasVendidos(masVendidosConfig.data().productos || []);
      }

      const ofertasConfig = configSnap.docs.find(d => d.id === "ofertas");
      if (ofertasConfig?.exists()) {
        const data = ofertasConfig.data();
        setOfertas(data.productos || data);
      }

      const nuevosConfig = configSnap.docs.find(d => d.id === "nuevos");
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

    } catch (error) {
      console.error("❌ Error cargando datos:", error);
    }
    setLoading(false);
  };

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
    setRestored(false);
  };

  const Section = ({ title, icon: Icon, items }: { title: string; icon?: any; items: Product[] }) => {
    if (items.length === 0) return null;
    
    return (
      <section className="py-16">
        <div className="flex items-center gap-3 mb-8">
          {Icon && <Icon size={24} className="text-primary" />}
          <h2 className="font-display font-bold text-2xl md:text-3xl tracking-tight text-foreground">
            {title}
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">     
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
              />
            </div>
          ))}
        </div>
      </section>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t("messages.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="fixed inset-0 -z-10" style={{ top: '80px', height: 'calc(100% - 80px)' }}>
        <img
          src="/images/hero/hero.avif"
          alt="Fondo"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <section className="py-16">
            <h2 className="font-display font-bold text-2xl md:text-3xl tracking-tight text-foreground mb-8 drop-shadow-lg">
              {t("home.categories")}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((cat, i) => {
                const Icon = categoryIcons[cat.id] || Package;
                const nombreCategoria = getNombreCategoria(cat);

                const ultimoProducto = products
                  .filter(p => p.categoria === cat.id && p.imagenes && p.imagenes.length > 0)
                  .sort((a, b) => (b.id > a.id ? 1 : -1))
                  [0];

                const imageUrl = ultimoProducto?.imagenes[0];

                return (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link
                      to={`/categoria/${cat.id}`}
                      className="group block relative rounded-xl overflow-hidden aspect-[4/3] glow-border"
                    >
                      <img
                        src={imageUrl || `https://placehold.co/600x400/2a2a2a/2ecc71?text=${nombreCategoria}`}
                        alt={nombreCategoria}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = `https://placehold.co/600x400/2a2a2a/2ecc71?text=${nombreCategoria}`;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary/20 backdrop-blur rounded-full flex items-center justify-center">
                            <Icon size={16} className="text-primary" />
                          </div>
                          <span className="font-display text-sm tracking-widest uppercase text-foreground">
                            {nombreCategoria}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {masVendidosList.length > 0 && (
            <Section title="MÁS VENDIDOS" icon={Star} items={masVendidosList} />
          )}

          {ofertasList.length > 0 && (
            <Section title="OFERTAS" icon={Percent} items={ofertasList} />
          )}

          {nuevosList.length > 0 && (
            <Section title="LO NUEVO" icon={Sparkles} items={nuevosList} />
          )}
        </div>
      </div>
      
      {showFooter && (
        <>
          <Footer />
          <MobileBottomBar />
          <ViberButton />
        </>
      )}
    </div>
  );
};

export default Index;