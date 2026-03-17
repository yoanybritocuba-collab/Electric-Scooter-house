import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebase/config";
import { useLanguage } from "@/contexts/LanguageContext";
import ProductCard from "@/components/ProductCard";
import { ArrowLeft, Package } from "lucide-react";

interface Product {
  id: string;
  nombre: string;
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

  // ===== LOGS DE DEPURACIÓN =====
  console.log("🔍 sessionStorage en CategoryPage:", {
    lastCategory: sessionStorage.getItem('lastCategory'),
    scrollData: sessionStorage.getItem(`scroll_${slug}`)
  });

  // ===== FORZAR SCROLL AL INICIO AL CARGAR CATEGORÍA =====
  useEffect(() => {
    window.scrollTo(0, 0);
    console.log("📌 CategoryPage: scroll forzado al inicio");
  }, []);

  // ===== GUARDAR SCROLL Y CATEGORÍA ANTES DE SALIR =====
  const handleProductClick = () => {
    if (!slug) return;
    const scrollPos = window.scrollY;
    sessionStorage.setItem(`scroll_${slug}`, scrollPos.toString());
    sessionStorage.setItem('lastCategory', slug);
    console.log("📌 Guardando scroll:", scrollPos, "para categoría:", slug);
  };

  // ===== RESTAURAR SCROLL AL VOLVER =====
  useEffect(() => {
    if (!slug) return;
    const savedScroll = sessionStorage.getItem(`scroll_${slug}`);
    console.log("🔄 CategoryPage cargada - slug:", slug, "scroll guardado:", savedScroll);
    
    if (savedScroll && products.length > 0) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedScroll));
        sessionStorage.removeItem(`scroll_${slug}`);
        console.log("✅ Scroll restaurado a:", savedScroll);
      }, 150);
    }
  }, [slug, products]);

  useEffect(() => {
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
    loadData();
  }, [slug]);

  const getNombreCategoria = (): string => {
    if (!categoria) return slug || "";
    if (lang === 'en' && categoria.nombre_en) return categoria.nombre_en;
    if (lang === 'gr' && categoria.nombre_gr) return categoria.nombre_gr;
    return categoria.nombre;
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t("messages.loading")}</p>
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
        {/* BOTÓN VOLVER */}
        <div className="mb-6">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-gray-400 hover:text-[#2ecc71] transition-colors group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-display tracking-widest">VOLVER</span>
          </Link>
        </div>

        <h1 className="font-display font-bold text-3xl md:text-4xl text-white mb-8">
          {getNombreCategoria()}
        </h1>

        {categoria?.descripcion && (
          <p className="text-gray-400 max-w-3xl mb-8">
            {lang === 'en' && categoria.descripcion}
            {lang === 'gr' && categoria.descripcion}
            {lang === 'es' && categoria.descripcion}
          </p>
        )}

        {products.length === 0 ? (
          <div className="text-center py-16">
            <Package size={64} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">
              No hay productos en esta categoría
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <Link
                key={product.id}
                to={`/producto/${product.id}`}
                onClick={handleProductClick}
              >
                <ProductCard
                  {...product}
                  descuento={ofertas[product.id]?.descuento}
                />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;