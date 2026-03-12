import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, collection, getDocs, query, where, limit } from "firebase/firestore";
import { db } from "@/firebase/config";
import { useLanguage } from "@/contexts/LanguageContext";
import ProductCard from "@/components/ProductCard";
import ProductHoverZoom from "@/components/ProductHoverZoom";
import { ArrowLeft } from "lucide-react";

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
  especificaciones: {
    autonomia?: string;
    autonomia_en?: string;
    autonomia_gr?: string;
    peso?: string;
    peso_en?: string;
    peso_gr?: string;
    plegable?: boolean;
    velocidad_max?: string;
    velocidad_max_en?: string;
    velocidad_max_gr?: string;
    motor?: string;
    motor_en?: string;
    motor_gr?: string;
    bateria?: string;
    bateria_en?: string;
    bateria_gr?: string;
    tiempo_carga?: string;
    tiempo_carga_en?: string;
    tiempo_carga_gr?: string;
    ruedas?: string;
    ruedas_en?: string;
    ruedas_gr?: string;
    cambios?: string;
    cambios_en?: string;
    cambios_gr?: string;
    suspension?: boolean;
    frenos?: string;
    frenos_en?: string;
    frenos_gr?: string;
    iluminacion?: string;
    iluminacion_en?: string;
    iluminacion_gr?: string;
    edad_recomendada?: string;
    edad_recomendada_en?: string;
    edad_recomendada_gr?: string;
    colores?: string[];
    luces?: boolean;
    sonidos?: boolean;
    [key: string]: any;
  };
}

const ProductDetail = () => {
  const { t, lang } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Función para obtener texto según el idioma
  const getText = (es: string, en?: string, gr?: string): string => {
    if (lang === 'en' && en) return en;
    if (lang === 'gr' && gr) return gr;
    return es;
  };

  useEffect(() => {
    if (product?.categoria) {
      sessionStorage.setItem('lastCategory', product.categoria);
    }
  }, [product]);

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;

      setLoading(true);
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
      }
      setLoading(false);
    };

    loadProduct();
  }, [id]);

  const goBack = () => {
    const lastCategory = sessionStorage.getItem('lastCategory');
    if (lastCategory) {
      sessionStorage.setItem(`scroll_${lastCategory}`, window.scrollY.toString());
    }
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Producto no encontrado</p>
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
        {/* Botón volver */}
        <button
          onClick={goBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-display tracking-widest">Volver</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Galería de imágenes */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-lg overflow-hidden bg-secondary">
              <ProductHoverZoom
                src={images[selectedImageIndex]}
                alt={getText(product.nombre, product.nombre_en, product.nombre_gr)}
              />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.nuevo && (
                  <span className="bg-primary text-primary-foreground text-xs font-display tracking-widest px-3 py-1.5 rounded-full">
                    NEW
                  </span>
                )}
                {product.rebaja && (
                  <span className="bg-destructive text-destructive-foreground text-xs font-display tracking-widest px-3 py-1.5 rounded-full">
                    SALE
                  </span>
                )}
                {product.masVendido && (
                  <span className="bg-foreground text-background text-xs font-display tracking-widest px-3 py-1.5 rounded-full">
                    BEST SELLER
                  </span>
                )}
              </div>

              {/* Contador de imágenes */}
              {images.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur px-3 py-1.5 rounded-full text-xs font-display tracking-widest text-foreground">
                  {selectedImageIndex + 1} / {images.length}
                </div>
              )}
            </div>

            {/* Miniaturas */}
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative aspect-square rounded-lg overflow-hidden bg-secondary transition-all duration-200 ${
                      index === selectedImageIndex
                        ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${getText(product.nombre, product.nombre_en, product.nombre_gr)} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Información del producto */}
          <div className="space-y-6">
            <div>
              <h1 className="font-display font-bold text-3xl md:text-4xl tracking-tight text-foreground">
                {getText(product.nombre, product.nombre_en, product.nombre_gr)}
              </h1>
              <div className="flex items-center gap-2 mt-4">
                {product.descuento ? (
                  <>
                    <p className="text-primary font-bold text-3xl">
                      {precioFinal.toFixed(2)}€
                    </p>
                    <p className="text-muted-foreground line-through text-xl">
                      {product.precio}€
                    </p>
                    <span className="bg-destructive text-destructive-foreground text-sm px-2 py-1 rounded">
                      -{product.descuento}%
                    </span>
                  </>
                ) : (
                  <p className="text-primary font-bold text-3xl">
                    {product.precio}€
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button className="flex-1 bg-primary text-primary-foreground font-display font-bold tracking-widest text-sm py-4 rounded-lg hover:bg-glow transition-all duration-300">
                {t("product.acquire")}
              </button>
              <a
                href={`https://wa.me/34666939396?text=Hola,%20me%20interesa%20el%20producto:%20${getText(product.nombre, product.nombre_en, product.nombre_gr)}%20(${precioFinal.toFixed(2)}€)%20https://electricscooterhouse.com/producto/${product.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-[#25D366] text-white font-display font-bold tracking-widest text-sm py-4 rounded-lg hover:bg-[#20BA5C] transition-all duration-300 text-center"
              >
                {t("product.whatsapp")}
              </a>
            </div>

            {/* Descripción */}
            <div className="pt-6 border-t border-border">
              <h2 className="font-display font-bold text-lg tracking-tight text-foreground mb-4">
                {t("product.description")}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {getText(
                  product.descripcion || "Sin descripción",
                  product.descripcion_en,
                  product.descripcion_gr
                )}
              </p>
            </div>

            {/* Especificaciones */}
            {Object.keys(product.especificaciones || {}).length > 0 && (
              <div className="pt-6 border-t border-border">
                <h2 className="font-display font-bold text-lg tracking-tight text-foreground mb-4">
                  {t("product.specs")}
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  {product.especificaciones?.autonomia && (
                    <div className="bg-secondary rounded-lg p-4">
                      <p className="text-xs text-muted-foreground mb-1">Autonomía</p>
                      <p className="font-bold text-foreground">
                        {getText(
                          product.especificaciones.autonomia,
                          product.especificaciones.autonomia_en,
                          product.especificaciones.autonomia_gr
                        )}
                      </p>
                    </div>
                  )}

                  {product.especificaciones?.peso && (
                    <div className="bg-secondary rounded-lg p-4">
                      <p className="text-xs text-muted-foreground mb-1">Peso</p>
                      <p className="font-bold text-foreground">
                        {getText(
                          product.especificaciones.peso,
                          product.especificaciones.peso_en,
                          product.especificaciones.peso_gr
                        )}
                      </p>
                    </div>
                  )}

                  {product.especificaciones?.velocidad_max && (
                    <div className="bg-secondary rounded-lg p-4">
                      <p className="text-xs text-muted-foreground mb-1">Velocidad máxima</p>
                      <p className="font-bold text-foreground">
                        {getText(
                          product.especificaciones.velocidad_max,
                          product.especificaciones.velocidad_max_en,
                          product.especificaciones.velocidad_max_gr
                        )}
                      </p>
                    </div>
                  )}

                  {product.especificaciones?.motor && (
                    <div className="bg-secondary rounded-lg p-4">
                      <p className="text-xs text-muted-foreground mb-1">Motor</p>
                      <p className="font-bold text-foreground">
                        {getText(
                          product.especificaciones.motor,
                          product.especificaciones.motor_en,
                          product.especificaciones.motor_gr
                        )}
                      </p>
                    </div>
                  )}

                  {product.especificaciones?.bateria && (
                    <div className="bg-secondary rounded-lg p-4">
                      <p className="text-xs text-muted-foreground mb-1">Batería</p>
                      <p className="font-bold text-foreground">
                        {getText(
                          product.especificaciones.bateria,
                          product.especificaciones.bateria_en,
                          product.especificaciones.bateria_gr
                        )}
                      </p>
                    </div>
                  )}

                  {product.especificaciones?.tiempo_carga && (
                    <div className="bg-secondary rounded-lg p-4">
                      <p className="text-xs text-muted-foreground mb-1">Tiempo de carga</p>
                      <p className="font-bold text-foreground">
                        {getText(
                          product.especificaciones.tiempo_carga,
                          product.especificaciones.tiempo_carga_en,
                          product.especificaciones.tiempo_carga_gr
                        )}
                      </p>
                    </div>
                  )}

                  {product.especificaciones?.ruedas && (
                    <div className="bg-secondary rounded-lg p-4">
                      <p className="text-xs text-muted-foreground mb-1">Ruedas</p>
                      <p className="font-bold text-foreground">
                        {getText(
                          product.especificaciones.ruedas,
                          product.especificaciones.ruedas_en,
                          product.especificaciones.ruedas_gr
                        )}
                      </p>
                    </div>
                  )}

                  {product.especificaciones?.cambios && (
                    <div className="bg-secondary rounded-lg p-4">
                      <p className="text-xs text-muted-foreground mb-1">Cambios</p>
                      <p className="font-bold text-foreground">
                        {getText(
                          product.especificaciones.cambios,
                          product.especificaciones.cambios_en,
                          product.especificaciones.cambios_gr
                        )}
                      </p>
                    </div>
                  )}

                  {product.especificaciones?.plegable !== undefined && (
                    <div className="bg-secondary rounded-lg p-4">
                      <p className="text-xs text-muted-foreground mb-1">Plegable</p>
                      <p className="font-bold text-foreground">
                        {product.especificaciones.plegable ? "Sí" : "No"}
                      </p>
                    </div>
                  )}

                  {product.especificaciones?.suspension !== undefined && (
                    <div className="bg-secondary rounded-lg p-4">
                      <p className="text-xs text-muted-foreground mb-1">Suspensión</p>
                      <p className="font-bold text-foreground">
                        {product.especificaciones.suspension ? "Sí" : "No"}
                      </p>
                    </div>
                  )}

                  {product.especificaciones?.frenos && (
                    <div className="bg-secondary rounded-lg p-4">
                      <p className="text-xs text-muted-foreground mb-1">Frenos</p>
                      <p className="font-bold text-foreground">
                        {getText(
                          product.especificaciones.frenos,
                          product.especificaciones.frenos_en,
                          product.especificaciones.frenos_gr
                        )}
                      </p>
                    </div>
                  )}

                  {product.especificaciones?.iluminacion && (
                    <div className="bg-secondary rounded-lg p-4">
                      <p className="text-xs text-muted-foreground mb-1">Iluminación</p>
                      <p className="font-bold text-foreground">
                        {getText(
                          product.especificaciones.iluminacion,
                          product.especificaciones.iluminacion_en,
                          product.especificaciones.iluminacion_gr
                        )}
                      </p>
                    </div>
                  )}

                  {product.especificaciones?.edad_recomendada && (
                    <div className="bg-secondary rounded-lg p-4">
                      <p className="text-xs text-muted-foreground mb-1">Edad recomendada</p>
                      <p className="font-bold text-foreground">
                        {getText(
                          product.especificaciones.edad_recomendada,
                          product.especificaciones.edad_recomendada_en,
                          product.especificaciones.edad_recomendada_gr
                        )}
                      </p>
                    </div>
                  )}

                  {product.especificaciones?.colores && product.especificaciones.colores.length > 0 && (
                    <div className="bg-secondary rounded-lg p-4 col-span-2">
                      <p className="text-xs text-muted-foreground mb-2">Colores disponibles</p>
                      <div className="flex flex-wrap gap-2">
                        {product.especificaciones.colores.map((color, index) => (
                          <span key={index} className="px-3 py-1 bg-background rounded-full text-sm">
                            {color}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Productos relacionados */}
        {related.length > 0 && (
          <div className="mt-16 pt-16 border-t border-border">
            <h2 className="font-display font-bold text-2xl tracking-tight text-foreground mb-8">
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