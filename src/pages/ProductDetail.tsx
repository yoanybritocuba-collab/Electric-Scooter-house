import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, collection, getDocs, query, where, limit } from "firebase/firestore";
import { db } from "@/firebase/config";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import ProductCard from "@/components/ProductCard";
import { 
  ArrowLeft, MessageCircle, Check, ShoppingCart, Palette, 
  Zap, Gauge, Battery, Star, ZoomIn, AlertCircle, 
  Settings, ChevronDown, ChevronUp, FileText 
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { translateText } from "@/services/translationService";

// ========== INTERFACES ==========
interface OpcionItem {
  id: string;
  nombre: string;
  nombre_en?: string;
  nombre_gr?: string;
  precioExtra: number;
  stock: number;
  codigoColor?: string;
  imagenes?: string[];
}

interface OpcionesProducto {
  voltajes: OpcionItem[];
  potencias: OpcionItem[];
  colores: OpcionItem[];
  amperios: OpcionItem[];
}

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
  opciones: OpcionesProducto;
  variantes?: any[];
  stockCombinaciones?: any[];
  stock?: number;
}

// ========== FUNCIONES SEGURAS ==========
const getSafeArray = (arr: any): any[] => {
  return Array.isArray(arr) ? arr : [];
};

// ========== DICCIONARIO LOCAL DE TRADUCCIONES ==========
const traduccionesEspecificacionesLocal: Record<string, Record<string, string>> = {
  'Batería': { en: 'Battery', gr: 'Μπαταρία' },
  'Autonomía': { en: 'Range', gr: 'Αυτονομία' },
  'Potencia': { en: 'Power', gr: 'Ισχύς' },
  'Potencia del motor': { en: 'Motor Power', gr: 'Ισχύς Μοτέρ' },
  'Velocidad máxima': { en: 'Max Speed', gr: 'Μέγιστη Ταχύτητα' },
  'Peso': { en: 'Weight', gr: 'Βάρος' },
  'Peso bruto': { en: 'Gross Weight', gr: 'Μικτό Βάρος' },
  'Peso neto': { en: 'Net Weight', gr: 'Καθαρό Βάρος' },
  'Peso máximo soportado': { en: 'Max Supported Weight', gr: 'Μέγιστο Υποστηριζόμενο Βάρος' },
  'Dimensiones': { en: 'Dimensions', gr: 'Διαστάσεις' },
  'Dimensiones del embalaje': { en: 'Package Dimensions', gr: 'Διαστάσεις Συσκευασίας' },
  'Medidas': { en: 'Measurements', gr: 'Μετρήσεις' },
  'Año': { en: 'Year', gr: 'Έτος' },
  'Modelo': { en: 'Model', gr: 'Μοντέλο' },
  'Motor': { en: 'Motor', gr: 'Μοτέρ' },
  'Frenos': { en: 'Brakes', gr: 'Φρένα' },
  'Suspensión': { en: 'Suspension', gr: 'Ανάρτηση' },
  'Neumáticos': { en: 'Tires', gr: 'Ελαστικά' },
  'Tiempo de carga': { en: 'Charging Time', gr: 'Χρόνος Φόρτισης' },
  'Tipo de batería': { en: 'Battery Type', gr: 'Τύπος Μπαταρίας' },
  'Carga máxima soportada': { en: 'Max Load', gr: 'Μέγιστο Φορτίο' },
  'Rango de velocidad': { en: 'Speed Range', gr: 'Εύρος Ταχύτητας' },
  'Edad recomendada': { en: 'Recommended Age', gr: 'Συνιστώμενη Ηλικία' },
  'Especificaciones': { en: 'Specifications', gr: 'Προδιαγραφές' },
  'Suspensión delantera': { en: 'Front Suspension', gr: 'Μπροστινή Ανάρτηση' },
  'Suspensión trasera': { en: 'Rear Suspension', gr: 'Πίσω Ανάρτηση' },
  'Freno delantero': { en: 'Front Brake', gr: 'Μπροστινό Φρένο' },
  'Freno trasero': { en: 'Rear Brake', gr: 'Πίσω Φρένο' },
  'Tamaño de rueda': { en: 'Wheel Size', gr: 'Μέγεθος Τροχού' },
  'Neumático delantero': { en: 'Front Tire', gr: 'Μπροστινό Ελαστικό' },
  'Neumático trasero': { en: 'Rear Tire', gr: 'Πίσω Ελαστικό' },
  'Carga máxima': { en: 'Max Load', gr: 'Μέγιστο Φορτίο' },
  'Peso neto (N.W.)': { en: 'Net Weight (N.W.)', gr: 'Καθαρό Βάρος (N.W.)' },
  'Peso bruto (G.W.)': { en: 'Gross Weight (G.W.)', gr: 'Μικτό Βάρος (G.W.)' },
};

// ========== FUNCIÓN PARA TRADUCIR ETIQUETAS ==========
const traducirEtiqueta = async (key: string, lang: string): Promise<string> => {
  if (lang === 'es') return key;
  if (lang === 'en' && traduccionesEspecificacionesLocal[key]?.en) {
    return traduccionesEspecificacionesLocal[key].en;
  }
  if (lang === 'gr' && traduccionesEspecificacionesLocal[key]?.gr) {
    return traduccionesEspecificacionesLocal[key].gr;
  }
  const targetLang = lang === 'en' ? 'en' : 'el';
  try {
    const result = await translateText(key, targetLang);
    if (result.texto && result.texto.trim() !== '') {
      return result.texto;
    }
  } catch (error) {
    console.error('Error traduciendo con Google:', error);
  }
  return key;
};

// ========== COMPONENTE PRINCIPAL ==========
const ProductDetail = () => {
  const { lang } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  
  // ========== ESTADOS ==========
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Opciones seleccionadas
  const [selectedVoltaje, setSelectedVoltaje] = useState<OpcionItem | null>(null);
  const [selectedPotencia, setSelectedPotencia] = useState<OpcionItem | null>(null);
  const [selectedColor, setSelectedColor] = useState<OpcionItem | null>(null);
  const [selectedAmperio, setSelectedAmperio] = useState<OpcionItem | null>(null);
  
  // Galería
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  
  // 🔥 ESTADOS PARA "VER MÁS / VER MENOS"
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showAllSpecs, setShowAllSpecs] = useState(false);
  
  // Especificaciones
  const [specItems, setSpecItems] = useState<any[]>([]);
  
  // Zoom
  const [isZooming, setIsZooming] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const scrollDoneRef = useRef(false);

  // ========== IDIOMAS ==========
  const getText = (es: string, en?: string, gr?: string): string => {
    if (lang === 'en' && en) return en;
    if (lang === 'gr' && gr) return gr;
    return es;
  };

  const translations = {
    description: { es: "Descripción", en: "Description", gr: "Περιγραφή" },
    viberConsult: { es: "Consultar por Viber", en: "Consult on Viber", gr: "Συμβουλή με Viber" },
    related: { es: "Productos relacionados", en: "Related products", gr: "Σχετικά προϊόντα" },
    back: { es: "Volver", en: "Back", gr: "Πίσω" },
    loading: { es: "Cargando...", en: "Loading...", gr: "Φόρτωση..." },
    notFound: { es: "Producto no encontrado", en: "Product not found", gr: "Προϊόν δεν βρέθηκε" },
    addToCart: { es: "Añadir al carrito", en: "Add to cart", gr: "Προσθήκη στο καλάθι" },
    selectVoltaje: { es: "Selecciona voltaje", en: "Select voltage", gr: "Επιλέξτε τάση" },
    selectPotencia: { es: "Selecciona potencia", en: "Select power", gr: "Επιλέξτε ισχύ" },
    selectColor: { es: "Selecciona color", en: "Select color", gr: "Επιλέξτε χρώμα" },
    selectAmperio: { es: "Selecciona amperios", en: "Select amps", gr: "Επιλέξτε αμπέρ" },
    voltajes: { es: "Voltajes", en: "Voltages", gr: "Τάσεις" },
    potencias: { es: "Potencias", en: "Powers", gr: "Ισχύς" },
    colors: { es: "Colores", en: "Colors", gr: "Χρώματα" },
    amperios: { es: "Amperios", en: "Amps", gr: "Αμπέρ" },
    specsTitle: { es: "Especificaciones", en: "Specifications", gr: "Προδιαγραφές" },
    stockAvailable: { es: "Disponible", en: "Available", gr: "Διαθέσιμο" },
    stockSoldOut: { es: "AGOTADO", en: "SOLD OUT", gr: "ΕΞΑΝΤΛΗΘΗΚΕ" },
    stockLastUnits: { es: "¡ÚLTIMAS UNIDADES!", en: "LAST UNITS!", gr: "ΤΕΛΕΥΤΑΙΕΣ ΜΟΝΑΔΕΣ!" },
    stockFewLeft: { es: "Quedan pocas unidades", en: "Few units left", gr: "Λίγες μονάδες έμειναν" },
    showMore: { es: "Ver más", en: "Show more", gr: "Δείτε περισσότερα" },
    showLess: { es: "Ver menos", en: "Show less", gr: "Δείτε λιγότερα" },
  };

  const getFixedText = (key: keyof typeof translations): string => {
    if (lang === 'en') return translations[key].en;
    if (lang === 'gr') return translations[key].gr;
    return translations[key].es;
  };

  // ========== DETECTAR MÓVIL ==========
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ========== CARGAR PRODUCTO ==========
  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      setLoading(true);
      
      try {
        const docRef = doc(db, "productos", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          
          const productData = { id: docSnap.id, ...data } as Product;
          setProduct(productData);
          
          const opciones = data.opciones || {};
          
          let coloresFromData: OpcionItem[] = [];
          if (opciones.colores && Array.isArray(opciones.colores) && opciones.colores.length > 0) {
            const firstColor = opciones.colores[0];
            if (typeof firstColor === 'object' && firstColor !== null) {
              coloresFromData = opciones.colores;
            }
          }
          
          if (coloresFromData.length === 0 && data.variantes && Array.isArray(data.variantes) && data.variantes.length > 0) {
            coloresFromData = data.variantes.map((v: any) => ({
              id: v.id || v.colorId || `color_${Date.now()}`,
              nombre: v.colorNombre || v.nombre || 'Color',
              nombre_en: v.colorNombreEn || v.colorNombre || 'Color',
              nombre_gr: v.colorNombreGr || v.colorNombre || 'Χρώμα',
              precioExtra: v.precioExtra || 0,
              stock: v.stock || 0,
              codigoColor: v.codigoColor || '#888888',
              imagenes: v.imagenes || []
            }));
          }
          
          const voltajesFromData = getSafeArray(opciones.voltajes);
          const potenciasFromData = getSafeArray(opciones.potencias);
          const amperiosFromData = getSafeArray(opciones.amperios);
          
          if (voltajesFromData.length > 0) {
            setSelectedVoltaje(voltajesFromData[0]);
          }
          if (potenciasFromData.length > 0) {
            setSelectedPotencia(potenciasFromData[0]);
          }
          if (coloresFromData.length > 0) {
            setSelectedColor(coloresFromData[0]);
          }
          if (amperiosFromData.length > 0) {
            setSelectedAmperio(amperiosFromData[0]);
          }
          
          if (!productData.opciones) {
            productData.opciones = { voltajes: [], potencias: [], colores: [], amperios: [] };
          }
          productData.opciones.voltajes = voltajesFromData;
          productData.opciones.potencias = potenciasFromData;
          productData.opciones.colores = coloresFromData;
          productData.opciones.amperios = amperiosFromData;

          const q = query(
            collection(db, "productos"),
            where("categoria", "==", productData.categoria),
            where("__name__", "!=", id),
            limit(8)
          );
          const relatedSnap = await getDocs(q);
          setRelated(relatedSnap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
          
          // Cargar especificaciones traducidas
          await cargarEspecificaciones(productData);
          
        } else {
          toast({
            title: "Error",
            description: "Producto no encontrado",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error cargando producto:", error);
        toast({
          title: "Error",
          description: "No se pudo cargar el producto",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadProduct();
  }, [id]);

  // ========== CARGAR ESPECIFICACIONES ==========
  const cargarEspecificaciones = async (productData: Product) => {
    if (!productData?.especificaciones) {
      setSpecItems([]);
      return;
    }
    
    const entries = Object.entries(productData.especificaciones)
      .filter(([key]) => {
        const isTranslation = key.endsWith('_en') || 
                              key.endsWith('_gr') || 
                              key.endsWith('_en_value') || 
                              key.endsWith('_gr_value');
        return !isTranslation;
      });
    
    const results = [];
    for (const [key, value] of entries) {
      const displayTitle = await traducirEtiqueta(key, lang);
      
      let displayValue = value;
      if (lang === 'en') {
        const enValueKey = `${key}_en_value`;
        if (productData.especificaciones[enValueKey]) {
          displayValue = productData.especificaciones[enValueKey];
        }
      } else if (lang === 'gr') {
        const grValueKey = `${key}_gr_value`;
        if (productData.especificaciones[grValueKey]) {
          displayValue = productData.especificaciones[grValueKey];
        }
      }
      
      const finalValue = displayValue && displayValue.toString().trim() !== '' ? displayValue : '—';
      results.push({ key, displayTitle, finalValue });
    }
    
    setSpecItems(results);
  };

  // ========== RECARGAR ESPECIFICACIONES AL CAMBIAR IDIOMA ==========
  useEffect(() => {
    if (product) {
      cargarEspecificaciones(product);
    }
  }, [lang]);

  // ========== SCROLL AL PRINCIPIO ==========
  useEffect(() => {
    if (!loading && product) {
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
        scrollDoneRef.current = true;
      }, 100);
    }
  }, [loading, product]);

  // ========== FUNCIONES ==========
  const goBack = () => navigate(-1);

  const obtenerStockCombinacion = (): number => {
    if (!product) return 0;
    
    if (product.stockCombinaciones && product.stockCombinaciones.length > 0) {
      const combinacion = product.stockCombinaciones.find((c: any) => {
        const colorMatch = selectedColor ? c.colorId === selectedColor.id : true;
        const voltajeMatch = selectedVoltaje ? c.voltajeId === selectedVoltaje.id : true;
        const potenciaMatch = selectedPotencia ? c.potenciaId === selectedPotencia.id : true;
        const amperioMatch = selectedAmperio ? c.amperioId === selectedAmperio.id : true;
        return colorMatch && voltajeMatch && potenciaMatch && amperioMatch;
      });
      return combinacion ? combinacion.stock : 0;
    }
    
    if (selectedColor) return selectedColor.stock || 0;
    if (selectedVoltaje) return selectedVoltaje.stock || 0;
    if (selectedPotencia) return selectedPotencia.stock || 0;
    if (selectedAmperio) return selectedAmperio.stock || 0;
    
    return (product as any).stock || 0;
  };

  const obtenerMensajeStock = (stock: number): { texto: string; color: string; icon: any } => {
    if (stock === 0) {
      return { texto: getFixedText('stockSoldOut'), color: 'text-red-500', icon: AlertCircle };
    } else if (stock >= 1 && stock <= 3) {
      return { texto: getFixedText('stockLastUnits'), color: 'text-orange-500', icon: AlertCircle };
    } else if (stock >= 4 && stock <= 5) {
      return { texto: getFixedText('stockFewLeft'), color: 'text-yellow-500', icon: AlertCircle };
    } else {
      return { texto: getFixedText('stockAvailable'), color: 'text-green-500', icon: null };
    }
  };

  const stockActual = obtenerStockCombinacion();
  const mensajeStock = obtenerMensajeStock(stockActual);

  const calcularPrecio = (): number => {
    if (!product) return 0;
    let base = product.descuento ? product.precio * (1 - product.descuento / 100) : product.precio;
    if (selectedVoltaje) base += selectedVoltaje.precioExtra || 0;
    if (selectedPotencia) base += selectedPotencia.precioExtra || 0;
    if (selectedColor) base += selectedColor.precioExtra || 0;
    if (selectedAmperio) base += selectedAmperio.precioExtra || 0;
    return base;
  };

  const precioFinal = calcularPrecio();

  const handleAddToCart = () => {
    if (!product) return;
    
    const hasVoltajes = product.opciones?.voltajes && product.opciones.voltajes.length > 0;
    const hasPotencias = product.opciones?.potencias && product.opciones.potencias.length > 0;
    const hasColores = product.opciones?.colores && product.opciones.colores.length > 0;
    const hasAmperios = product.opciones?.amperios && product.opciones.amperios.length > 0;
    
    if (hasVoltajes && !selectedVoltaje) {
      toast({ title: getFixedText('selectVoltaje'), variant: "destructive" });
      return;
    }
    if (hasPotencias && !selectedPotencia) {
      toast({ title: getFixedText('selectPotencia'), variant: "destructive" });
      return;
    }
    if (hasColores && !selectedColor) {
      toast({ title: getFixedText('selectColor'), variant: "destructive" });
      return;
    }
    if (hasAmperios && !selectedAmperio) {
      toast({ title: getFixedText('selectAmperio'), variant: "destructive" });
      return;
    }

    if (stockActual === 0) {
      toast({ title: "Producto agotado", description: "No hay stock disponible para esta combinación", variant: "destructive" });
      return;
    }

    let nombreProducto = product.nombre;
    if (selectedVoltaje) nombreProducto += ` - ${selectedVoltaje.nombre}`;
    if (selectedPotencia) nombreProducto += ` ${selectedPotencia.nombre}`;
    if (selectedAmperio) nombreProducto += ` ${selectedAmperio.nombre}`;
    if (selectedColor) nombreProducto += ` (${selectedColor.nombre})`;

    const imagenCarrito = selectedColor?.imagenes?.[0] || product.imagenes?.[0] || "";

    addItem({
      id: product.id,
      variantId: selectedColor?.id,
      variantPrecioId: selectedVoltaje?.id || selectedPotencia?.id || selectedAmperio?.id,
      nombre: nombreProducto,
      nombre_en: product.nombre_en || product.nombre,
      nombre_gr: product.nombre_gr || product.nombre,
      color: selectedColor?.nombre,
      color_en: selectedColor?.nombre_en,
      color_gr: selectedColor?.nombre_gr,
      precio: precioFinal,
      imagen: imagenCarrito
    });
    
    setAddedToCart(true);
    toast({
      title: getText("¡Añadido!", "Added!", "Προστέθηκε!"),
      description: nombreProducto,
      className: "bg-green-500 text-white",
    });
    setTimeout(() => setAddedToCart(false), 1500);
  };

  // ========== GALERÍA ==========
  const getCurrentImages = (): string[] => {
    if (selectedColor?.imagenes && selectedColor.imagenes.length > 0) {
      return selectedColor.imagenes;
    }
    return product?.imagenes || [];
  };

  const images = getCurrentImages();
  const currentImage = images[selectedImageIndex] || product?.imagenes?.[0] || "";

  // ========== ZOOM ==========
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  const viberNumber = "306993185757";

  // ========== FUNCIÓN PARA CAMBIAR COLOR ==========
  const handleColorSelect = (color: OpcionItem) => {
    if (color.stock === 0) return;
    setSelectedColor(color);
    setSelectedImageIndex(0);
  };

  // ========== COMPONENTE SELECTOR DE OPCIONES ==========
  const OpcionSelector = ({ 
    titulo, 
    icon: Icon, 
    opciones, 
    selected, 
    onSelect,
    showColor = false,
    colorKey = 'codigoColor',
    compact = false
  }: any) => {
    if (!opciones || !Array.isArray(opciones) || opciones.length === 0) return null;
    
    return (
      <div className={compact ? 'space-y-1' : 'bg-gray-900/40 rounded-xl p-3 md:p-4 border border-gray-700/30'}>
        <p className={`text-gray-400 ${compact ? 'text-[10px]' : 'text-[10px] md:text-xs'} uppercase tracking-wider flex items-center gap-1.5`}>
          <Icon size={compact ? 12 : 14} className="text-purple-500" />
          {titulo}
        </p>
        <div className={`flex flex-wrap gap-1.5 ${compact ? 'mt-1' : 'mt-2'}`}>
          {opciones.map((opcion: OpcionItem) => {
            const isSelected = selected?.id === opcion.id;
            const nombre = getText(opcion.nombre, opcion.nombre_en, opcion.nombre_gr);
            const isOutOfStock = opcion.stock === 0;
            
            return (
              <button
                key={opcion.id}
                onClick={() => !isOutOfStock && onSelect(opcion)}
                disabled={isOutOfStock}
                className={`relative rounded-lg transition-all border ${
                  compact ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm'
                } ${
                  isSelected
                    ? 'border-purple-500 bg-purple-500/20 shadow-[0_0_15px_rgba(147,51,234,0.15)]'
                    : isOutOfStock
                      ? 'border-gray-700 bg-gray-800/30 opacity-50 cursor-not-allowed'
                      : 'border-gray-700 bg-gray-800/50 hover:border-gray-500 hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {showColor && (
                    <div 
                      className={`rounded-full border border-gray-600 flex-shrink-0 ${
                        compact ? 'w-3 h-3' : 'w-4 h-4'
                      }`}
                      style={{ backgroundColor: opcion[colorKey] || '#888' }}
                    />
                  )}
                  <span className={`font-medium ${isSelected ? 'text-purple-400' : 'text-white'}`}>
                    {nombre}
                  </span>
                  {opcion.precioExtra > 0 && (
                    <span className={`text-gray-400 ${compact ? 'text-[8px]' : 'text-[10px]'}`}>
                      +{opcion.precioExtra}€
                    </span>
                  )}
                  {isSelected && <Check size={compact ? 10 : 12} className="text-purple-500 flex-shrink-0" />}
                </div>
                {isOutOfStock && (
                  <span className="text-[8px] text-red-500 ml-1">Agotado</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // ========== LOADING ==========
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-[90px] md:pt-24">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#2ecc71] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">{getFixedText('loading')}</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-[90px] md:pt-24">
        <p className="text-gray-400">{getFixedText('notFound')}</p>
      </div>
    );
  }

  // ========== RENDER ==========
  return (
    <div ref={mainRef} className="min-h-screen pt-[90px] md:pt-24 pb-16 bg-black">
      <div className="max-w-7xl mx-auto px-3 md:px-4 lg:px-8">
        
        {/* ===== BOTÓN VOLVER ===== */}
        <div className="pt-2 md:pt-4 pb-3 md:pb-4">
          <button
            onClick={goBack}
            className="flex items-center gap-1.5 md:gap-2 text-gray-400 hover:text-[#2ecc71] transition-colors group"
          >
            <ArrowLeft size={isMobile ? 16 : 18} className="group-hover:-translate-x-1 transition-transform" />
            <span className={`font-normal ${isMobile ? 'text-xs' : 'text-sm'}`}>{getFixedText('back')}</span>
          </button>
        </div>

        {isMobile ? (
          <div className="space-y-3">
            
            {/* ===== 1. FOTO ARRIBA ===== */}
            <div className="bg-gray-900/30 rounded-xl overflow-hidden border border-gray-800 p-2">
              <div 
                ref={imageRef}
                className="relative aspect-square rounded-lg overflow-hidden bg-gray-900"
              >
                <img
                  src={currentImage}
                  alt={product.nombre}
                  className="w-full h-full object-contain"
                />

                <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
                  {product.masVendido && (
                    <span className="bg-yellow-500 text-black text-[8px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                      <Star size={8} /> TOP
                    </span>
                  )}
                  {product.nuevo && (
                    <span className="bg-green-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">✨ NUEVO</span>
                  )}
                  {product.rebaja && product.descuento && (
                    <span className="bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">-{product.descuento}%</span>
                  )}
                </div>
                
                {images.length > 1 && (
                  <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded-full text-[8px] text-gray-300">
                    {selectedImageIndex + 1} / {images.length}
                  </div>
                )}
              </div>

              {images.length > 1 && (
                <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1 justify-center">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all w-12 h-12 ${
                        selectedImageIndex === idx
                          ? "border-[#2ecc71] shadow-[0_0_15px_rgba(46,204,113,0.2)]"
                          : "border-gray-700 hover:border-gray-500"
                      }`}
                    >
                      <img src={img} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ===== 2. NOMBRE + PRECIO + STOCK ===== */}
            <div>
              <h1 className="text-base font-bold text-white leading-tight line-clamp-2">
                {product.nombre}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-[#2ecc71] font-bold text-xl">
                  {precioFinal.toFixed(2)}€
                </p>
                {product.descuento && product.descuento > 0 ? (
                  <p className="text-gray-500 line-through text-xs">{product.precio}€</p>
                ) : null}
              </div>
              {stockActual > 0 && (
                <div className={`flex items-center gap-1 mt-0.5 text-xs ${mensajeStock.color}`}>
                  <span>{mensajeStock.texto}</span>
                  <span className="text-gray-500 text-[9px]">({stockActual})</span>
                </div>
              )}
              {stockActual === 0 && (
                <div className="flex items-center gap-1 mt-0.5 text-xs text-red-500">
                  <AlertCircle size={12} />
                  <span>{getFixedText('stockSoldOut')}</span>
                </div>
              )}
            </div>

            {/* ===== 🔥 3. DESCRIPCIÓN CON "VER MÁS / VER MENOS" (MÓVIL) ===== */}
            {product.descripcion && (
              <div className="bg-gray-900/40 rounded-xl p-3 border border-gray-700/30">
                <div className="flex items-center gap-1.5 mb-1">
                  <FileText size={12} className="text-blue-500" />
                  <p className="text-gray-400 text-[10px] uppercase tracking-wider">
                    {getFixedText('description')}
                  </p>
                </div>
                <div className="text-gray-300 text-xs leading-relaxed">
                  <div className={`overflow-hidden transition-all duration-300 ${showFullDescription ? 'max-h-[1000px]' : 'max-h-10'}`}>
                    {getText(
                      product.descripcion,
                      product.descripcion_en,
                      product.descripcion_gr
                    )}
                  </div>
                  {product.descripcion.length > 60 && (
                    <button
                      onClick={() => setShowFullDescription(!showFullDescription)}
                      className="mt-1 text-[10px] text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                    >
                      {showFullDescription ? (
                        <>
                          <ChevronUp size={12} />
                          {getFixedText('showLess')}
                        </>
                      ) : (
                        <>
                          <ChevronDown size={12} />
                          {getFixedText('showMore')}
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ===== 4. OPCIONES ===== */}
            <div className="space-y-1.5">
              {product.opciones?.voltajes && product.opciones.voltajes.length > 0 && (
                <OpcionSelector
                  titulo={getFixedText('voltajes')}
                  icon={Battery}
                  opciones={product.opciones.voltajes}
                  selected={selectedVoltaje}
                  onSelect={setSelectedVoltaje}
                  compact={true}
                />
              )}

              {product.opciones?.potencias && product.opciones.potencias.length > 0 && (
                <OpcionSelector
                  titulo={getFixedText('potencias')}
                  icon={Gauge}
                  opciones={product.opciones.potencias}
                  selected={selectedPotencia}
                  onSelect={setSelectedPotencia}
                  compact={true}
                />
              )}

              {product.opciones?.amperios && product.opciones.amperios.length > 0 && (
                <OpcionSelector
                  titulo={getFixedText('amperios')}
                  icon={Zap}
                  opciones={product.opciones.amperios}
                  selected={selectedAmperio}
                  onSelect={setSelectedAmperio}
                  compact={true}
                />
              )}
            </div>

            {/* ===== 5. COLORES ===== */}
            {product.opciones?.colores && product.opciones.colores.length > 0 && (
              <div className="bg-gray-900/40 rounded-xl p-3 border border-gray-700/30">
                <p className="text-gray-400 text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                  <Palette size={12} className="text-purple-500" />
                  {getFixedText('colors')}
                </p>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {product.opciones.colores.map((color: OpcionItem) => {
                    const isSelected = selectedColor?.id === color.id;
                    const isOutOfStock = color.stock === 0;
                    const nombre = getText(color.nombre, color.nombre_en, color.nombre_gr);
                    
                    return (
                      <button
                        key={color.id}
                        onClick={() => !isOutOfStock && handleColorSelect(color)}
                        disabled={isOutOfStock}
                        className={`flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs transition-all ${
                          isSelected
                            ? 'border-purple-500 bg-purple-500/20'
                            : isOutOfStock
                              ? 'border-gray-700 bg-gray-800/30 opacity-50 cursor-not-allowed'
                              : 'border-gray-700 bg-gray-800/50 hover:border-gray-500'
                        }`}
                      >
                        <div 
                          className="w-3 h-3 rounded-full border border-gray-600 flex-shrink-0"
                          style={{ backgroundColor: color.codigoColor || '#888' }}
                        />
                        <span className={isSelected ? 'text-purple-400' : 'text-white'}>
                          {nombre}
                        </span>
                        {color.precioExtra > 0 && (
                          <span className="text-gray-400 text-[8px]">+{color.precioExtra}€</span>
                        )}
                        {isSelected && <Check size={10} className="text-purple-500" />}
                        {isOutOfStock && <span className="text-[8px] text-red-500">Agotado</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ===== 🔥 6. ESPECIFICACIONES CON "VER MÁS / VER MENOS" (MÓVIL) ===== */}
            <div className="bg-gray-900/40 rounded-xl p-3 border border-gray-700/30">
              <p className="text-gray-400 text-[10px] uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Settings size={12} className="text-purple-500" />
                {getFixedText('specsTitle')}
              </p>
              
              <div className="space-y-1.5">
                {specItems.length > 0 ? (
                  <>
                    {specItems.slice(0, showAllSpecs ? specItems.length : 3).map(({ key, displayTitle, finalValue }) => (
                      <div key={key} className="flex justify-between items-center border-b border-gray-800/50 pb-1 last:border-0">
                        <span className="text-gray-400 text-[10px] truncate max-w-[55%]">{displayTitle}</span>
                        <span className="text-white text-[10px] font-medium truncate max-w-[40%] text-right">{finalValue}</span>
                      </div>
                    ))}
                    {specItems.length > 3 && (
                      <button
                        onClick={() => setShowAllSpecs(!showAllSpecs)}
                        className="mt-1 text-[10px] text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
                      >
                        {showAllSpecs ? (
                          <>
                            <ChevronUp size={12} />
                            {getFixedText('showLess')}
                          </>
                        ) : (
                          <>
                            <ChevronDown size={12} />
                            {getFixedText('showMore')}
                          </>
                        )}
                      </button>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500 text-[10px]">Sin especificaciones</p>
                )}
              </div>
            </div>

            {/* ===== 7. BOTONES ===== */}
            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={handleAddToCart}
                disabled={
                  stockActual === 0 ||
                  (product.opciones?.voltajes?.length > 0 && !selectedVoltaje) ||
                  (product.opciones?.potencias?.length > 0 && !selectedPotencia) ||
                  (product.opciones?.amperios?.length > 0 && !selectedAmperio) ||
                  (product.opciones?.colores?.length > 0 && !selectedColor)
                }
                className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm ${
                  stockActual === 0
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : (product.opciones?.voltajes?.length > 0 && !selectedVoltaje) ||
                      (product.opciones?.potencias?.length > 0 && !selectedPotencia) ||
                      (product.opciones?.amperios?.length > 0 && !selectedAmperio) ||
                      (product.opciones?.colores?.length > 0 && !selectedColor)
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : addedToCart ? 'bg-green-500 text-white' : 'bg-[#2ecc71] text-black hover:bg-[#27ae60] shadow-[0_0_30px_rgba(46,204,113,0.2)]'
                }`}
              >
                {addedToCart ? <Check size={16} /> : <ShoppingCart size={16} />}
                {stockActual === 0 ? getFixedText('stockSoldOut') : getFixedText('addToCart')} · {precioFinal.toFixed(2)}€
              </button>
              <a
                href={`viber://contact?number=${viberNumber}`}
                onClick={(e) => { e.preventDefault(); window.open(`https://msng.link/vi/${viberNumber}`, '_blank'); }}
                className="w-full py-3 bg-[#7360f2] hover:bg-[#5e4ad9] text-white rounded-xl flex items-center justify-center gap-2 font-medium text-sm"
              >
                <MessageCircle size={16} />
                {getFixedText('viberConsult')}
              </a>
            </div>
          </div>
        ) : (
          // ======== LAYOUT ESCRITORIO ========
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
            
            {/* COLUMNA IZQUIERDA: GALERÍA */}
            <div className="md:col-span-1">
              <div className="bg-gray-900/30 rounded-xl md:rounded-2xl overflow-hidden border border-gray-800 p-2 md:p-3">
                <div 
                  ref={imageRef}
                  className="relative aspect-square rounded-lg md:rounded-xl overflow-hidden bg-gray-900"
                  onMouseEnter={() => !isMobile && setIsZooming(true)}
                  onMouseLeave={() => setIsZooming(false)}
                  onMouseMove={!isMobile ? handleMouseMove : undefined}
                  style={{ cursor: isMobile ? 'default' : 'zoom-in' }}
                >
                  <img
                    src={currentImage}
                    alt={product.nombre}
                    className={`w-full h-full object-contain transition-transform duration-300 ${
                      isZooming && !isMobile ? 'scale-[2.5]' : 'scale-100'
                    }`}
                    style={{
                      transformOrigin: isZooming ? `${mousePosition.x}% ${mousePosition.y}%` : 'center'
                    }}
                  />

                  {!isMobile && (
                    <div className={`absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-full text-[10px] text-gray-300 flex items-center gap-1 transition-opacity duration-300 ${
                      isZooming ? 'opacity-0' : 'opacity-100'
                    }`}>
                      <ZoomIn size={12} className="text-gray-400" />
                      <span>Zoom</span>
                    </div>
                  )}

                  <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
                    {product.masVendido && (
                      <span className="bg-yellow-500 text-black text-[8px] md:text-[9px] font-bold px-1.5 md:px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <Star size={isMobile ? 8 : 10} /> TOP
                      </span>
                    )}
                    {product.nuevo && (
                      <span className="bg-green-500 text-white text-[8px] md:text-[9px] font-bold px-1.5 md:px-2 py-0.5 rounded-full">✨ NUEVO</span>
                    )}
                    {product.rebaja && product.descuento && (
                      <span className="bg-red-500 text-white text-[8px] md:text-[9px] font-bold px-1.5 md:px-2 py-0.5 rounded-full">-{product.descuento}%</span>
                    )}
                  </div>
                  
                  {images.length > 1 && (
                    <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm px-1.5 md:px-2 py-0.5 rounded-full text-[8px] md:text-[10px] text-gray-300">
                      {selectedImageIndex + 1} / {images.length}
                    </div>
                  )}
                </div>

                {images.length > 1 && (
                  <div className="flex gap-1.5 md:gap-2 mt-2 md:mt-3 overflow-x-auto pb-1 justify-center">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                          isMobile ? 'w-12 h-12' : 'w-14 h-14 md:w-16 md:h-16'
                        } ${
                          selectedImageIndex === idx
                            ? "border-[#2ecc71] shadow-[0_0_15px_rgba(46,204,113,0.2)]"
                            : "border-gray-700 hover:border-gray-500"
                        }`}
                      >
                        <img src={img} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* COLUMNA DERECHA: INFORMACIÓN */}
            <div className="md:col-span-1 space-y-3 md:space-y-4">
              <div>
                <h1 className="font-bold text-white text-xl md:text-2xl leading-tight">
                  {product.nombre}
                </h1>
                <div className="flex items-center gap-2 md:gap-3 mt-1">
                  <p className="text-[#2ecc71] font-bold text-2xl md:text-3xl">
                    {precioFinal.toFixed(2)}€
                  </p>
                  {product.descuento && product.descuento > 0 ? (
                    <p className="text-gray-500 line-through text-sm md:text-base">{product.precio}€</p>
                  ) : null}
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-xs">
                  <span className={mensajeStock.color}>{mensajeStock.texto}</span>
                  {stockActual > 0 && (
                    <span className="text-gray-500 text-[10px]">({stockActual})</span>
                  )}
                </div>
              </div>

              {/* ===== 🔥 DESCRIPCIÓN CON "VER MÁS / VER MENOS" (ESCRITORIO) ===== */}
              {product.descripcion && (
                <div className="mt-2">
                  <div className="flex items-center gap-1.5 mb-1">
                    <FileText size={14} className="text-blue-500" />
                    <p className="text-gray-400 text-xs uppercase tracking-wider">
                      {getFixedText('description')}
                    </p>
                  </div>
                  <div className="text-gray-300 text-sm leading-relaxed max-w-lg">
                    <div className={`overflow-hidden transition-all duration-300 ${showFullDescription ? 'max-h-[1000px]' : 'max-h-12'}`}>
                      {getText(
                        product.descripcion,
                        product.descripcion_en,
                        product.descripcion_gr
                      )}
                    </div>
                    {product.descripcion.length > 80 && (
                      <button
                        onClick={() => setShowFullDescription(!showFullDescription)}
                        className="mt-1 text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                      >
                        {showFullDescription ? (
                          <>
                            <ChevronUp size={14} />
                            {getFixedText('showLess')}
                          </>
                        ) : (
                          <>
                            <ChevronDown size={14} />
                            {getFixedText('showMore')}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {product.opciones?.voltajes && product.opciones.voltajes.length > 0 && (
                <OpcionSelector
                  titulo={getFixedText('voltajes')}
                  icon={Battery}
                  opciones={product.opciones.voltajes}
                  selected={selectedVoltaje}
                  onSelect={setSelectedVoltaje}
                  compact={true}
                />
              )}

              {product.opciones?.potencias && product.opciones.potencias.length > 0 && (
                <OpcionSelector
                  titulo={getFixedText('potencias')}
                  icon={Gauge}
                  opciones={product.opciones.potencias}
                  selected={selectedPotencia}
                  onSelect={setSelectedPotencia}
                  compact={true}
                />
              )}

              {product.opciones?.amperios && product.opciones.amperios.length > 0 && (
                <OpcionSelector
                  titulo={getFixedText('amperios')}
                  icon={Zap}
                  opciones={product.opciones.amperios}
                  selected={selectedAmperio}
                  onSelect={setSelectedAmperio}
                  compact={true}
                />
              )}

              {product.opciones?.colores && product.opciones.colores.length > 0 && (
                <OpcionSelector
                  titulo={getFixedText('colors')}
                  icon={Palette}
                  opciones={product.opciones.colores}
                  selected={selectedColor}
                  onSelect={handleColorSelect}
                  showColor={true}
                  colorKey="codigoColor"
                  compact={true}
                />
              )}

              <div className="flex flex-col sm:flex-row gap-2 md:gap-3 pt-1 md:pt-2">
                <button
                  onClick={handleAddToCart}
                  disabled={stockActual === 0 || (product.opciones?.voltajes?.length > 0 && !selectedVoltaje) || (product.opciones?.potencias?.length > 0 && !selectedPotencia) || (product.opciones?.amperios?.length > 0 && !selectedAmperio) || (product.opciones?.colores?.length > 0 && !selectedColor)}
                  className={`flex-1 py-3 md:py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm md:text-base ${
                    stockActual === 0 || (product.opciones?.voltajes?.length > 0 && !selectedVoltaje) || (product.opciones?.potencias?.length > 0 && !selectedPotencia) || (product.opciones?.amperios?.length > 0 && !selectedAmperio) || (product.opciones?.colores?.length > 0 && !selectedColor)
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : addedToCart ? 'bg-green-500 text-white' : 'bg-[#2ecc71] text-black hover:bg-[#27ae60] shadow-[0_0_30px_rgba(46,204,113,0.2)]'
                  }`}
                >
                  {addedToCart ? <Check size={isMobile ? 16 : 20} /> : <ShoppingCart size={isMobile ? 16 : 20} />}
                  {stockActual === 0 ? getFixedText('stockSoldOut') : getFixedText('addToCart')} · {precioFinal.toFixed(2)}€
                </button>
                <a
                  href={`viber://contact?number=${viberNumber}`}
                  onClick={(e) => { e.preventDefault(); window.open(`https://msng.link/vi/${viberNumber}`, '_blank'); }}
                  className="px-4 md:px-6 py-3 md:py-3.5 bg-[#7360f2] hover:bg-[#5e4ad9] text-white rounded-xl flex items-center justify-center gap-2 font-medium text-xs md:text-sm"
                >
                  <MessageCircle size={isMobile ? 16 : 18} />
                  <span className="hidden sm:inline">{getFixedText('viberConsult')}</span>
                </a>
              </div>

              {/* ===== 🔥 ESPECIFICACIONES CON "VER MÁS / VER MENOS" (ESCRITORIO) ===== */}
              {specItems.length > 0 && (
                <div className="pt-2 md:pt-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Settings size={14} className="text-purple-500" />
                    <p className="text-gray-400 text-xs uppercase tracking-wider">
                      {getFixedText('specsTitle')}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1 md:gap-1.5">
                    {specItems.slice(0, showAllSpecs ? specItems.length : 3).map(({ key, displayTitle, finalValue }) => (
                      <span key={key} className={`bg-gray-800/50 px-1.5 md:px-2 py-0.5 rounded-full text-gray-400 border border-gray-700/50 ${
                        isMobile ? 'text-[8px]' : 'text-[10px]'
                      }`}>
                        • <span className="text-white">{displayTitle}: {finalValue}</span>
                      </span>
                    ))}
                    {specItems.length > 3 && (
                      <button
                        onClick={() => setShowAllSpecs(!showAllSpecs)}
                        className="text-[10px] text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
                      >
                        {showAllSpecs ? (
                          <>
                            <ChevronUp size={12} />
                            {getFixedText('showLess')}
                          </>
                        ) : (
                          <>
                            <ChevronDown size={12} />
                            {getFixedText('showMore')}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== PRODUCTOS RELACIONADOS ===== */}
        {related.length > 0 && (
          <div className="mt-8 md:mt-12 pt-4 md:pt-6 border-t border-gray-800">
            <h2 className={`font-display font-bold tracking-tight text-gray-400 mb-3 md:mb-4 uppercase ${
              isMobile ? 'text-xs' : 'text-sm'
            }`}>
              {getFixedText('related')}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
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