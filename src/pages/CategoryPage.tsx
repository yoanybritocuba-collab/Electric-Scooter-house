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

    const loadProducts = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, "productos"), where("categoria", "==", slug));
        const snap = await getDocs(q);
        const productsData = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
        setProducts(productsData);
      } catch (error) {
        console.error("Error cargando productos:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [slug]);

  // Restaurar scroll cuando se cargan los productos
  useEffect(() => {
    if (!loading && products.length > 0) {
      const savedPosition = sessionStorage.getItem(`scroll_${slug}`);
      if (savedPosition && savedPosition !== "0") {
        setTimeout(() => {
          window.scrollTo({ top: parseInt(savedPosition), behavior: 'auto' });
          sessionStorage.removeItem(`scroll_${slug}`);
        }, 100);
      }
    }
  }, [loading, products, slug]);

  const categoryName = slug ? t(`categories.${slug}`) : "";

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        {/* Botón Volver */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-[#2ecc71] transition-colors mb-6 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-display tracking-widest">VOLVER</span>
        </button>

        <h1 className="font-display font-bold text-3xl md:text-4xl tracking-tight text-white mb-8">
          {categoryName}
        </h1>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-900 rounded-lg animate-pulse" />
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
            <p className="text-gray-400 text-lg">{t("messages.no_products")}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;