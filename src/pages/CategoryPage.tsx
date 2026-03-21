import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebase/config";
import { useLanguage } from "@/contexts/LanguageContext";
import ProductCard from "@/components/ProductCard";
import { motion } from "framer-motion";
import { ArrowLeft, Package } from "lucide-react";

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
  activo: boolean;
}

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, lang } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [categoria, setCategoria] = useState<Categoria | null>(null);
  const [loading, setLoading] = useState(true);
  const [ofertas, setOfertas] = useState<Record<string, { activo: boolean; descuento: number }>>({});

  const handleProductClick = () => {
    if (!slug) return;
    sessionStorage.setItem(`scroll_${slug}`, window.scrollY.toString());
    sessionStorage.setItem('lastCategory', slug);
  };

  useEffect(() => {
    if (!slug) return;
    const savedScroll = sessionStorage.getItem(`scroll_${slug}`);
    
    if (savedScroll && products.length > 0) {
      setTimeout(() => {
        window.scrollTo({
          top: parseInt(savedScroll),
          behavior: 'auto'
        });
        sessionStorage.removeItem(`scroll_${slug}`);
      }, 100);
    }
  }, [slug, products]);

  useEffect(() => {
    loadData();
  }, [slug]);

  const loadData = async () => {
    setLoading(true);
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
          descuento: data.descuento || 0
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
    <div className="min-h-screen pt-32 pb-16">
      <div className="fixed inset-0 -z-10" style={{ top: '80px', height: 'calc(100% - 80px)' }}>
        <img src="/images/hero/hero.avif" alt="Fondo" className="w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10">
        {/* Botón volver */}
        <div className="mb-6">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-gray-400 hover:text-primary transition-colors group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-normal capitalize">{getText("volver", "back", "πίσω")}</span>
          </Link>
        </div>

        <h1 className="font-display font-bold text-3xl md:text-4xl text-white mb-4">
          {getNombreCategoria()}
        </h1>

        {categoria?.descripcion && (
          <p className="text-gray-400 max-w-3xl mb-8">
            {getText(categoria.descripcion, categoria.descripcion, categoria.descripcion)}
          </p>
        )}

        {products.length === 0 ? (
          <div className="text-center py-16">
            <Package size={64} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">
              {getText("No hay productos en esta categoría", "No products in this category", "Δεν υπάρχουν προϊόντα σε αυτήν την κατηγορία")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                onClick={handleProductClick}
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
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;