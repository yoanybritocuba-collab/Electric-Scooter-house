import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebase/config";
import { useLanguage } from "@/contexts/LanguageContext";
import ProductCard from "@/components/ProductCard";
import { motion } from "framer-motion";
import { ArrowLeft, Package, Search, AlertCircle } from "lucide-react";

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
  especificaciones?: any;
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
  activo: boolean;
}

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categoria, setCategoria] = useState<Categoria | null>(null);
  const [loading, setLoading] = useState(true);
  const [ofertas, setOfertas] = useState<Record<string, { activo: boolean; descuento: number }>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const scrollRestored = useRef(false);

  const handleProductClick = (productId: string) => {
    if (!slug) return;
    const currentScroll = window.scrollY;
    sessionStorage.setItem(`scroll_${slug}`, currentScroll.toString());
    sessionStorage.setItem('lastCategory', slug);
    navigate(`/producto/${productId}`);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    if (!slug || scrollRestored.current || loading) return;
    
    const savedScroll = sessionStorage.getItem(`scroll_${slug}`);
    if (savedScroll && products.length > 0) {
      const scrollPos = parseInt(savedScroll);
      console.log(`🔄 [CategoryPage] Restaurando scroll de ${slug} a:`, scrollPos);
      setTimeout(() => {
        window.scrollTo({
          top: scrollPos,
          behavior: 'auto'
        });
        sessionStorage.removeItem(`scroll_${slug}`);
        scrollRestored.current = true;
      }, 150);
    }
  }, [slug, loading, products]);

  useEffect(() => {
    loadData();
    return () => {
      scrollRestored.current = false;
    };
  }, [slug]);

  const loadData = async () => {
    setLoading(true);
    scrollRestored.current = false;
    try {
      if (!slug) return;
      
      const catQuery = query(collection(db, "categorias"), where("id", "==", slug));
      const catSnap = await getDocs(catQuery);
      if (!catSnap.empty) {
        setCategoria(catSnap.docs[0].data() as Categoria);
      }

      const productsQuery = query(collection(db, "productos"), where("categoria", "==", slug));
      const productsSnap = await getDocs(productsQuery);
      const loadedProducts = productsSnap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          nombre: data.nombre || "",
          nombre_en: data.nombre_en,
          nombre_gr: data.nombre_gr,
          precio: data.precio || 0,
          categoria: data.categoria || "",
          imagenes: data.imagenes || [],
          masVendido: data.masVendido === true,
          nuevo: data.nuevo === true,
          rebaja: data.rebaja === true,
          descuento: data.descuento || 0,
          especificaciones: data.especificaciones || {},
          variantes: data.variantes || [],
          variantesUnificadas: data.variantesUnificadas || [],
          opciones: data.opciones || { voltajes: [], potencias: [], colores: [] }
        } as Product;
      });
      setProducts(loadedProducts);

      const configSnap = await getDocs(collection(db, "configuracion"));
      const ofertasConfig = configSnap.docs.find(d => d.id === "ofertas");
      if (ofertasConfig?.exists()) {
        setOfertas(ofertasConfig.data().productos || {});
      }
    } catch (error) {
      console.error("Error cargando datos:", error);
    }
    setLoading(false);
  };

  const filteredProducts = products.filter(product => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const nombre = product.nombre.toLowerCase();
    const nombre_en = product.nombre_en?.toLowerCase() || "";
    const nombre_gr = product.nombre_gr?.toLowerCase() || "";
    return nombre.includes(term) || nombre_en.includes(term) || nombre_gr.includes(term);
  });

  const getNombreCategoria = (): string => {
    if (!categoria) return slug || "";
    if (lang === 'en' && categoria.nombre_en) return categoria.nombre_en;
    if (lang === 'gr' && categoria.nombre_gr) return categoria.nombre_gr;
    return categoria.nombre;
  };

  const getText = (es: string, en?: string, gr?: string): string => {
    if (lang === 'en' && en) return en;
    if (lang === 'gr' && gr) return gr;
    return es;
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t("messages.loading") || "Cargando..."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="fixed inset-0 -z-10" style={{ top: '80px', height: 'calc(100% - 80px)' }}>
        <img src="/images/hero/hero.avif" alt="Fondo" className="w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10">
        <div className="mb-6">
          {/* Botón volver */}
          <div className="pt-6 mb-2">
            <button
              onClick={handleGoBack}
              className="inline-flex items-center gap-2 text-gray-400 hover:text-green-500 transition-colors group"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-normal capitalize text-green-500 hover:text-green-400">
                {getText("volver", "back", "πίσω")}
              </span>
            </button>
          </div>

          <h1 className="font-display font-bold text-3xl md:text-4xl text-green-500 mb-4">
            {getNombreCategoria()}
          </h1>

          {categoria?.descripcion && (
            <p className="text-gray-400 max-w-3xl mb-6">
              {getText(categoria.descripcion, categoria.descripcion, categoria.descripcion)}
            </p>
          )}

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={getText(
                "Buscar en esta categoría...",
                "Search in this category...",
                "Αναζήτηση σε αυτήν την κατηγορία..."
              )}
              className="w-full bg-gray-900/50 border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-gray-600 focus:border-green-500/50 outline-none"
            />
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-gray-900/50 rounded-2xl border border-orange-500/20">
            <AlertCircle size={48} className="text-orange-500 mx-auto mb-4" />
            <p className="text-orange-500 text-lg font-medium">
              {getText(
                "No hay artículos en esta área",
                "No items in this area",
                "Δεν υπάρχουν προϊόντα σε αυτήν την περιοχή"
              )}
            </p>
            <p className="text-orange-400/70 text-sm mt-2">
              {getText(
                "Próximamente tendremos más productos disponibles",
                "Soon we will have more products available",
                "Σύντομα θα έχουμε περισσότερα προϊόντα διαθέσιμα"
              )}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex justify-between items-center">
              <p className="text-gray-400 text-sm">
                {filteredProducts.length} {getText("productos encontrados", "products found", "προϊόντα βρέθηκαν")}
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => handleProductClick(product.id)}
                >
                  <ProductCard
                    id={product.id}
                    nombre={product.nombre}
                    nombre_en={product.nombre_en}
                    nombre_gr={product.nombre_gr}
                    precio={product.precio}
                    imagenes={product.imagenes}
                    masVendido={product.masVendido}
                    nuevo={product.nuevo}
                    rebaja={product.rebaja}
                    descuento={ofertas[product.id]?.descuento || product.descuento}
                    tieneColores={product.opciones?.colores?.length > 0 || (product.variantes && product.variantes.length > 0)}
                    colores={product.opciones?.colores || product.variantes || []}
                    variantesUnificadas={product.variantesUnificadas || []}
                    opciones={product.opciones}
                  />
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;