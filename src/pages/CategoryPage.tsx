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
      const q = query(collection(db, "productos"), where("categoria", "==", slug));
      const snap = await getDocs(q);
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product)));
      setLoading(false);
    };

    loadProducts();
  }, [slug]);

  const goBack = () => {
    if (slug) {
      sessionStorage.setItem(`scroll_${slug}`, window.scrollY.toString());
    }
    navigate(-1);
  };

  const categoryName = slug ? t(`categories.${slug}`) : "";

  return (
    <div className="min-h-screen pt-24 pb-16 relative">
      {/* Imagen de fondo visible */}
      <div className="fixed inset-0 -z-10">
        <img
          src="/images/hero/hero.png"
          alt="Fondo categoría"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10">
        <button
          onClick={goBack}
          className="flex items-center gap-2 text-gray-300 hover:text-[#2ecc71] transition-colors mb-6 group bg-black/30 backdrop-blur-sm px-4 py-2 rounded-lg"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-display tracking-widest">VOLVER</span>
        </button>

        <h1 className="font-display font-bold text-3xl md:text-4xl tracking-tight text-white mb-8 drop-shadow-lg">
          {categoryName}
        </h1>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-800/50 backdrop-blur-sm rounded-lg animate-pulse" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((p) => (
              <div key={p.id} className="backdrop-blur-sm bg-black/20 rounded-lg p-2">
                <ProductCard {...p} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-black/30 backdrop-blur-sm rounded-lg">
            <p className="text-gray-300 text-lg">{t("messages.no_products")}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;