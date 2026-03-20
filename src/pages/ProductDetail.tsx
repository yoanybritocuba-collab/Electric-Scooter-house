import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, collection, getDocs, query, where, limit } from "firebase/firestore";
import { db } from "@/firebase/config";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import ProductCard from "@/components/ProductCard";
import ProductImageGallery from "@/components/ProductImageGallery";
import { ArrowLeft, MessageCircle } from "lucide-react";

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
  const { lang } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const mainRef = useRef<HTMLDivElement>(null);
  const scrollDoneRef = useRef(false);

  const getText = (es: string, en?: string, gr?: string): string => {
    if (lang === 'en' && en) return en;
    if (lang === 'gr' && gr) return gr;
    return es;
  };

  const translations = {
    description: {
      es: "Descripción",
      en: "Description",
      gr: "Περιγραφή"
    },
    specifications: {
      es: "Especificaciones",
      en: "Specifications",
      gr: "Προδιαγραφές"
    },
    viberConsult: {
      es: "Consultar por Viber",
      en: "Consult on Viber",
      gr: "Συμβουλή με Viber"
    },
    related: {
      es: "Productos relacionados",
      en: "Related products",
      gr: "Σχετικά προϊόντα"
    },
    back: {
      es: "Volver",
      en: "Back",
      gr: "Πίσω"
    },
    loading: {
      es: "Cargando producto...",
      en: "Loading product...",
      gr: "Φόρτωση προϊόντος..."
    },
    notFound: {
      es: "Producto no encontrado",
      en: "Product not found",
      gr: "Προϊόν δεν βρέθηκε"
    },
    freeShipping: {
      es: "Envío gratis a partir de 50€",
      en: "Free shipping from 50€",
      gr: "Δωρεάν αποστολή από 50€"
    },
    returns: {
      es: "Devoluciones hasta 30 días",
      en: "Returns up to 30 days",
      gr: "Επιστροφές έως 30 ημέρες"
    },
    warranty: {
      es: "Garantía de 2 años",
      en: "2 year warranty",
      gr: "Εγγύηση 2 ετών"
    }
  };

  const getFixedText = (key: keyof typeof translations): string => {
    if (lang === 'en') return translations[key].en;
    if (lang === 'gr') return translations[key].gr;
    return translations[key].es;
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

  useEffect(() => {
    if (scrollDoneRef.current) return;
    
    const forceScrollToTop = () => {
      window.scrollTo(0, 0);
      if (mainRef.current) {
        mainRef.current.scrollIntoView({ behavior: 'auto', block: 'start' });
      }
      scrollDoneRef.current = true;
    };
    
    if (!loading) {
      setTimeout(forceScrollToTop, 100);
    }
  }, [loading]);

  const goBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#2ecc71] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">{getFixedText('loading')}</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">{getFixedText('notFound')}</p>
      </div>
    );
  }

  const images = product.imagenes?.length > 0 
    ? product.imagenes 
    : ["https://placehold.co/600x400/2a2a2a/2ecc71?text=Sin+imagen"];
    
  const precioFinal = product.descuento
    ? product.precio * (1 - product.descuento / 100)
    : product.precio;

  const viberNumber = "306993185757";

  return (
    <div 
      ref={mainRef}
      className="min-h-screen pt-32 pb-16"
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        {/* Botón volver */}
        <div className="mb-8">
          <button
            onClick={goBack}
            className="flex items-center gap-2 text-gray-400 hover:text-[#2ecc71] transition-colors group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-normal capitalize">{getFixedText('back')}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <ProductImageGallery 
              images={images} 
              productName={getText(product.nombre, product.nombre_en, product.nombre_gr)}
              productId={product.id}
              productNombre={product.nombre}
              productNombreEn={product.nombre_en}
              productNombreGr={product.nombre_gr}
              productPrecio={precioFinal}
            />
          </div>

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

            {/* Beneficios */}
            <div className="grid grid-cols-3 gap-2 py-4 border-y border-gray-800">
              <div className="text-center">
                <svg className="w-5 h-5 text-[#2ecc71] mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h18" />
                </svg>
                <p className="text-xs text-gray-400">{getFixedText('freeShipping')}</p>
              </div>
              <div className="text-center">
                <svg className="w-5 h-5 text-[#2ecc71] mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <p className="text-xs text-gray-400">{getFixedText('returns')}</p>
              </div>
              <div className="text-center">
                <svg className="w-5 h-5 text-[#2ecc71] mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <p className="text-xs text-gray-400">{getFixedText('warranty')}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-800">
              <h2 className="font-display font-bold text-lg tracking-tight text-white mb-4">
                {getFixedText('description')}
              </h2>
              <p className="text-gray-400 leading-relaxed">
                {getText(
                  product.descripcion || "Sin descripción",
                  product.descripcion_en,
                  product.descripcion_gr
                )}
              </p>
            </div>

            {product.especificaciones && Object.keys(product.especificaciones).length > 0 && (
              <div className="pt-2 border-t border-gray-800">
                <h2 className="font-display font-bold text-lg tracking-tight text-white mb-4">
                  {getFixedText('specifications')}
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

            {/* Botón Viber */}
            <div className="pt-4">
              <a
                href={`viber://contact?number=${viberNumber}`}
                onClick={(e) => {
                  e.preventDefault();
                  window.open(`https://msng.link/vi/${viberNumber}`, '_blank');
                }}
                className="w-full bg-[#7360f2] hover:bg-[#5e4ad9] text-white font-display font-bold tracking-widest text-lg py-5 rounded-xl text-center transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <MessageCircle size={26} />
                {getFixedText('viberConsult')}
              </a>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-16 pt-16 border-t border-gray-800">
            <h2 className="font-display font-bold text-2xl tracking-tight text-white mb-8">
              {getFixedText('related')}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {related.map((p) => (
                <ProductCard 
                  key={p.id}
                  id={p.id}
                  nombre={p.nombre}
                  nombre_en={p.nombre_en}
                  nombre_gr={p.nombre_gr}
                  precio={p.precio}
                  imagenes={p.imagenes}
                  masVendido={p.masVendido}
                  nuevo={p.nuevo}
                  rebaja={p.rebaja}
                  descuento={p.descuento}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;