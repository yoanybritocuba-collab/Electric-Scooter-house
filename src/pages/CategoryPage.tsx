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
    if (!slug) return;

    // Guardar la URL actual para cuando volvamos
    sessionStorage.setItem('lastCategory', slug);

    const q = query(collection(db, "productos"), where("categoria", "==", slug));
    getDocs(q).then((snap) => {
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product)));
      setLoading(false);

      // Restaurar scroll DESPUÉS de que los productos se hayan cargado
      const savedPosition = sessionStorage.getItem(`scroll_${slug}`);
      if (savedPosition) {
        // Múltiples intentos para asegurar que el DOM está listo
        setTimeout(() => {
          window.scrollTo({
            top: parseInt(savedPosition),
            behavior: 'instant' as ScrollBehavior
          });
          sessionStorage.removeItem(`scroll_${slug}`);
        }, 100);
        
        setTimeout(() => {
          const currentPos = window.scrollY;
          const targetPos = parseInt(savedPosition);
          if (Math.abs(currentPos - targetPos) > 10) {
            window.scrollTo({
              top: targetPos,
              behavior: 'instant' as ScrollBehavior
            });
          }
        }, 300);
      }
    }).catch(() => setLoading(false));
  }, [slug]);

  const goBack = () => {
    // Guardar la posición actual ANTES de salir
    const currentSlug = slug || sessionStorage.getItem('lastCategory');
    if (currentSlug) {
      sessionStorage.setItem(`scroll_${currentSlug}`, window.scrollY.toString());
    }
    navigate(-1);
  };

  const categoryName = slug ? t(`categories.${slug}`) : "";

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