import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, collection, getDocs, query, where, limit } from "firebase/firestore"; 
import { db } from "@/firebase/config";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { useScrollPosition } from "@/hooks/useScrollPosition";
import TouchGallery from "@/components/TouchGallery";
import ProductCard from "@/components/ProductCard";
import { ArrowLeft, ShoppingCart, MessageCircle } from "lucide-react";

interface Product {
  id: string;
  nombre: string;
  nombre_en?: string;
  nombre_gr?: string;
  descripcion: string;
  descripcion_en?: string;
  descripcion_gr?: string;
  precio: number;
  categoria: string;
  imagenes: string[];
  masVendido?: boolean;
  nuevo?: boolean;
  rebaja?: boolean;
  descuento?: number;
  especificaciones: any;
}

const ProductDetail = () => {
  const { t, lang } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  useScrollPosition(`producto-${id}`);
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState(false);

  const getText = (es: string, en?: string, gr?: string): string => {
    if (lang === 'en' && en) return en;
    if (lang === 'gr' && gr) return gr;
    return es;
  };

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;

      try {
        const docSnap = await getDoc(doc(db, "productos", id));
        if (docSnap.exists()) {
          const productData = { id: docSnap.id, ...docSnap.data() } as Product;
          setProduct(productData);

          const q = query(
            collection(db, "productos"),
            where("categoria", "==", productData.categoria),
            where("__name__", "!=", id),
            limit(4)
          );
          const relatedSnap = await getDocs(q);
          setRelated(relatedSnap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));    
        }
      } catch (error) {
        console.error("Error cargando producto:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const goBack = () => {
    navigate(-1);
  };

  const handleAddToCart = () => {
    if (!product) return;

    addItem({
      id: product.id,
      nombre: product.nombre,
      precio: product.descuento
        ? product.precio * (1 - product.descuento / 100)
        : product.precio,
      imagen: product.imagenes?.[0] || "/placeholder-image.jpg"
    });

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#2ecc71] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Producto no encontrado</p>
      </div>
    );
  }

  const images = product.imagenes?.length ? product.imagenes : ["/placeholder-image.jpg"];  
  const precioFinal = product.descuento
    ? product.precio * (1 - product.descuento / 100)
    : product.precio;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        {/* Botón Volver */}
        <button
          onClick={goBack}
          className="flex items-center gap-2 text-gray-400 hover:text-[#2ecc71] transition-colors mb-6 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-display tracking-widest">VOLVER</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* GALERÍA TÁCTIL */}
          <div className="lg:col-span-1">
            <TouchGallery
              images={images}
              productName={getText(product.nombre, product.nombre_en, product.nombre_gr)}   
            />
          </div>

          {/* Información del producto */}
          <div className="space-y-6">
            <div>
              <h1 className="font-display font-bold text-3xl md:text-4xl tracking-tight text-white">
                {getText(product.nombre, product.nombre_en, product.nombre_gr)}
              </h1>
              <div className="flex items-center gap-2 mt-4">
                <p className="text-[#2ecc71] font-bold text-3xl">{precioFinal.toFixed(2)}€</p>
                {product.descuento && (
                  <>
                    <p className="text-gray-500 line-through text-xl">{product.precio}€</p>
                    <span className="bg-red-500 text-white text-sm px-2 py-1 rounded">      
                      -{product.descuento}%
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Descripción */}
            <div className="pt-6 border-t border-gray-800">
              <h2 className="font-display font-bold text-lg tracking-tight text-white mb-4">
                {t("product.description")}
              </h2>
              <p className="text-gray-400 leading-relaxed">
                {getText(
                  product.descripcion || "Sin descripción",
                  product.descripcion_en,
                  product.descripcion_gr
                )}
              </p>
            </div>

            {/* Especificaciones */}
            {product.especificaciones && Object.keys(product.especificaciones).length > 0 && (
              <div className="pt-6 border-t border-gray-800">
                <h2 className="font-display font-bold text-lg tracking-tight text-white mb-4">
                  Especificaciones
                </h2>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {Object.entries(product.especificaciones).map(([key, value]) => {
                    if (typeof value === 'string' && value && !key.endsWith('_en') && !key.endsWith('_gr')) {
                      return (
                        <div key={key} className="bg-gray-900 rounded-lg p-3">
                          <p className="text-xs text-gray-500 mb-1">{key}</p>
                          <p className="text-white text-sm">{value}</p>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button className="flex-1 bg-primary text-primary-foreground font-display font-bold tracking-widest text-sm py-4 rounded-lg hover:bg-glow transition-all duration-300">   
                COMPRAR AHORA
              </button>

              {/* BOTÓN DE VIBER (reemplaza a WhatsApp) */}
              <a
                href={`viber://chat?number=+306993185757`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-[#7360F2] hover:bg-[#5a4ac7] text-white font-display font-bold tracking-widest text-sm py-4 rounded-lg text-center transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden"
              >
                {/* Ondas moradas */}
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-white/20 opacity-75 animate-ping"></span>
                  <span className="absolute inline-flex h-3/4 w-3/4 rounded-full bg-white/10 opacity-50 animate-ping animation-delay-300"></span>
                  <span className="absolute inline-flex h-1/2 w-1/2 rounded-full bg-white/5 opacity-25 animate-ping animation-delay-600"></span>
                </span>
                <MessageCircle size={18} className="relative z-10" />
                <span className="relative z-10">CONSULTAR POR VIBER</span>
              </a>

              <button
                onClick={handleAddToCart}
                className="relative flex-1 bg-[#2ecc71] hover:bg-[#27ae60] text-white font-display font-bold tracking-widest text-sm py-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                <ShoppingCart size={18} />
                AÑADIR AL CARRITO
                {addedToCart && (
                  <span className="absolute -top-2 -right-2 bg-white text-[#2ecc71] text-xs px-2 py-1 rounded-full animate-pulse shadow-lg">
                    ✓
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Productos relacionados */}
        {related.length > 0 && (
          <div className="mt-16 pt-16 border-t border-gray-800">
            <h2 className="font-display font-bold text-2xl tracking-tight text-white mb-8"> 
              {t("product.related")}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {related.map((p) => (
                <ProductCard key={p.id} {...p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;