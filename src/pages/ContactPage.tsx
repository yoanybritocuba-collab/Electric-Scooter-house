import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebase/config";
import { useLanguage } from "@/contexts/LanguageContext";
import ProductCard from "@/components/ProductCard";
import { ArrowLeft } from "lucide-react";

interface Product {
  id: string;
  nombre: string;
  precio: number;
  categoria: string;
  imagenes: string[];
  masVendido?: boolean;
  nuevo?: boolean;
  rebaja?: boolean;
}

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("🔵 CategoryPage montada - slug:", slug);
    
    if (!slug) return;

    // Cargar productos
    const q = query(collection(db, "productos"), where("categoria", "==", slug));
    getDocs(q).then((snap) => {
      console.log("🟢 Productos cargados:", snap.size);
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product)));
      setLoading(false);
    }).catch((error) => {
      console.error("🔴 Error cargando productos:", error);
      setLoading(false);
    });

    // RESTAURAR SCROLL
    const savedPosition = sessionStorage.getItem('test_scroll');
    console.log("🟡 Posición guardada encontrada:", savedPosition);
    
    if (savedPosition) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedPosition));
        console.log("✅ Intentando restaurar scroll a:", savedPosition);
        setTimeout(() => {
          console.log("📌 Scroll actual después de restaurar:", window.scrollY);
        }, 100);
      }, 500);
    }
  }, [slug]);

  const categoryName = slug ? t(`categories.${slug}`) : "";

  const goBack = () => {
    const pos = window.scrollY;
    console.log("💾 Guardando posición:", pos);
    sessionStorage.setItem('test_scroll', pos.toString());
    navigate(-1);
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <button
          onClick={goBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 group"
        >
          <ArrowLeft size={20} />
          <span>VOLVER</span>
        </button>

        <h1 className="font-display font-bold text-3xl md:text-4xl tracking-tight text-foreground mb-8">
          {categoryName}
        </h1>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square bg-secondary rounded-lg animate-pulse" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">{t("messages.no_products")}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;