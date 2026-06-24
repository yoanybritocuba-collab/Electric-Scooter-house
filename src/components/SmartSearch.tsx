import { useState, useEffect, useMemo, useRef } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/config";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { X, Search, ArrowLeft, Zap, Euro, Sparkles, ImageOff, Phone, Mail, Loader2, SlidersHorizontal, Palette, Gauge, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Product {
  id: string;
  nombre: string;
  nombre_en?: string;
  nombre_gr?: string;
  precio: number;
  categoria: string;
  imagenes: string[];
  descripcion?: string;
  especificaciones?: any;
  masVendido?: boolean;
  nuevo?: boolean;
  rebaja?: boolean;
  descuento?: number;
  variantes?: Array<{
    id: string;
    colorNombre: string;
    colorNombreEn: string;
    colorNombreGr: string;
    codigoColor: string;
    imagenes: string[];
    stock: number;
    precioExtra: number;
  }>;
}

interface SmartSearchProps {
  open: boolean;
  onClose: () => void;
}

const getTranslatedText = (lang: string, es: string, en: string, gr: string) => {
  if (lang === 'en') return en;
  if (lang === 'gr') return gr;
  return es;
};

// Función para obtener todos los colores de un producto
const getProductColorsList = (product: Product): string[] => {
  const colors: string[] = [];
  if (product.variantes && product.variantes.length > 0) {
    product.variantes.forEach(v => {
      if (v.colorNombre) colors.push(v.colorNombre.toLowerCase());
      if (v.colorNombreEn) colors.push(v.colorNombreEn.toLowerCase());
      if (v.colorNombreGr) colors.push(v.colorNombreGr.toLowerCase());
    });
  }
  return colors;
};

// Función para obtener texto de búsqueda completo
const getSearchText = (product: Product): string => {
  return `${product.nombre} ${product.nombre_en || ''} ${product.nombre_gr || ''} ${product.descripcion || ''} ${product.categoria}`.toLowerCase();
};

// Verificar si un producto tiene un color específico
const productHasColor = (product: Product, colorTerm: string): boolean => {
  if (!colorTerm) return true;
  const colors = getProductColorsList(product);
  return colors.some(c => c.includes(colorTerm.toLowerCase()) || colorTerm.toLowerCase().includes(c));
};

// Obtener potencia del producto
const getProductPotencia = (product: Product): number => {
  const potencia = product.especificaciones?.potencia_motor || 
                    product.especificaciones?.Motor || 
                    product.especificaciones?.Potencia || 0;
  return typeof potencia === 'number' ? potencia : parseInt(String(potencia)) || 0;
};

const hasValidImage = (product: Product): boolean => {
  return product.imagenes && product.imagenes.length > 0 && product.imagenes[0] && !product.imagenes[0].includes("placehold.co");
};

const isValidProduct = (product: Product): boolean => {
  if (product.id === "aPMG8JBnCm9cRsLNnFJ6") return false;
  if (!product.nombre || product.nombre.trim() === "") return false;
  if (product.precio <= 0) return false;
  return true;
};

const SmartSearch = ({ open, onClose }: SmartSearchProps) => {
  const { lang } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [colorTerm, setColorTerm] = useState("");
  const [potenciaTerm, setPotenciaTerm] = useState<string>("");
  const [priceMin, setPriceMin] = useState<number>(0);
  const [priceMax, setPriceMax] = useState<number>(5000);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  const getText = (es: string, en: string, gr: string) => {
    if (lang === 'en') return en;
    if (lang === 'gr') return gr;
    return es;
  };

  useEffect(() => {
    if (open && products.length === 0) {
      loadProducts();
    }
  }, [open]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "productos"));
      const loadedProducts = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Product[];
      const validProducts = loadedProducts.filter(p => isValidProduct(p) && hasValidImage(p));
      setProducts(validProducts);
      console.log(`📦 Productos válidos cargados: ${validProducts.length}`);
    } catch (error) {
      console.error("Error cargando productos:", error);
    }
    setLoading(false);
  };

  // RESULTADOS EXACTOS
  const exactResults = useMemo(() => {
    const hasFilters = searchTerm || colorTerm || potenciaTerm || priceMin > 0 || priceMax < 5000;
    if (!hasFilters) return [];
    
    setSearching(true);
    const potenciaNum = potenciaTerm ? parseInt(potenciaTerm) : null;
    
    console.log("🔍 Búsqueda exacta:", { searchTerm, colorTerm, potenciaTerm, priceMin, priceMax });
    
    const results = products.filter(product => {
      let matches = true;
      
      if (searchTerm) {
        const searchText = getSearchText(product);
        const term = searchTerm.toLowerCase();
        matches = matches && searchText.includes(term);
      }
      
      if (matches && colorTerm) {
        matches = matches && productHasColor(product, colorTerm);
      }
      
      if (matches && potenciaNum && potenciaNum > 0) {
        const productPotencia = getProductPotencia(product);
        if (productPotencia > 0) {
          matches = matches && Math.abs(productPotencia - potenciaNum) <= potenciaNum * 0.2;
        } else {
          matches = false;
        }
      }
      
      if (matches && (priceMin > 0 || priceMax < 5000)) {
        matches = matches && (product.precio >= priceMin && product.precio <= priceMax);
      }
      
      return matches;
    });
    
    setTimeout(() => setSearching(false), 100);
    return results.slice(0, 8);
  }, [searchTerm, colorTerm, potenciaTerm, priceMin, priceMax, products]);

  // PRODUCTOS SIMILARES (siempre, excluyendo los exactos)
  const similarProducts = useMemo(() => {
    const hasFilters = searchTerm || colorTerm || potenciaTerm || priceMin > 0 || priceMax < 5000;
    if (!hasFilters) return [];
    
    setSearching(true);
    const potenciaNum = potenciaTerm ? parseInt(potenciaTerm) : null;
    const exactIds = new Set(exactResults.map(p => p.id));
    
    const results = products.filter(product => {
      // Excluir productos que ya están en resultados exactos
      if (exactIds.has(product.id)) return false;
      
      let score = 0;
      
      // Coincidencia por nombre/texto
      if (searchTerm) {
        const searchText = getSearchText(product);
        if (searchText.includes(searchTerm.toLowerCase())) {
          score += 30;
        }
      }
      
      // Coincidencia por color
      if (colorTerm && productHasColor(product, colorTerm)) {
        score += 40;
      }
      
      // Coincidencia por potencia (cercana)
      if (potenciaNum && potenciaNum > 0) {
        const productPotencia = getProductPotencia(product);
        if (productPotencia > 0 && Math.abs(productPotencia - potenciaNum) <= potenciaNum * 0.3) {
          score += 35;
        }
      }
      
      // Coincidencia por precio
      if (priceMin > 0 || priceMax < 5000) {
        if (product.precio >= priceMin && product.precio <= priceMax) {
          score += 20;
        }
      }
      
      return score > 0;
    });
    
    const scored = results.map(p => ({
      product: p,
      score: (() => {
        let s = 0;
        if (searchTerm && getSearchText(p).includes(searchTerm.toLowerCase())) s += 30;
        if (colorTerm && productHasColor(p, colorTerm)) s += 40;
        const pot = getProductPotencia(p);
        if (potenciaNum && pot > 0 && Math.abs(pot - potenciaNum) <= potenciaNum * 0.3) s += 35;
        if (priceMin > 0 || priceMax < 5000) {
          if (p.precio >= priceMin && p.precio <= priceMax) s += 20;
        }
        return s;
      })()
    }));
    
    scored.sort((a, b) => b.score - a.score);
    
    setTimeout(() => setSearching(false), 100);
    return scored.slice(0, 6).map(s => s.product);
  }, [searchTerm, colorTerm, potenciaTerm, priceMin, priceMax, products, exactResults]);

  const handleProductClick = (productId: string) => {
    onClose();
    navigate(`/producto/${productId}`);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setColorTerm("");
    setPotenciaTerm("");
    setPriceMin(0);
    setPriceMax(5000);
    setShowFilters(false);
  };

  const hasActiveFilters = searchTerm !== "" || colorTerm !== "" || potenciaTerm !== "" || priceMin > 0 || priceMax < 5000;

  const viberNumber = "306993185757";
  const email = "info@electricscooterhouse.com";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] bg-black flex flex-col"
        >
          {/* Header */}
          <div className="flex-shrink-0 bg-[#0a0a0a] border-b border-green-900/30 px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={onClose}
                className="p-1.5 text-gray-400 hover:text-green-500 transition-colors flex items-center gap-2"
              >
                <ArrowLeft size={18} />
                <span className="text-xs">{getText("Volver", "Back", "Πίσω")}</span>
              </button>
              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <button
                    onClick={handleClearSearch}
                    className="text-[10px] text-green-500 hover:text-green-400 px-2 py-1"
                  >
                    {getText("Limpiar todo", "Clear all", "Εκκαθάριση όλων")}
                  </button>
                )}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    showFilters ? "bg-green-500/20 text-green-500" : "text-gray-400 hover:text-green-500"
                  }`}
                >
                  <SlidersHorizontal size={16} />
                </button>
              </div>
            </div>

            {/* Campos de búsqueda separados */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={getText(
                    "Buscar por nombre...",
                    "Search by name...",
                    "Αναζήτηση με όνομα..."
                  )}
                  className="w-full bg-black/50 border border-green-900/30 rounded-lg pl-9 pr-3 py-2 text-white text-sm placeholder:text-gray-600 focus:border-green-500/50 outline-none"
                />
              </div>

              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3 pt-1"
                >
                  <div className="relative">
                    <Palette className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input
                      type="text"
                      value={colorTerm}
                      onChange={(e) => setColorTerm(e.target.value)}
                      placeholder={getText(
                        "Color (ej: rojo, azul, negro...)",
                        "Color (eg: red, blue, black...)",
                        "Χρώμα (π.χ: κόκκινο, μπλε, μαύρο...)"
                      )}
                      className="w-full bg-black/50 border border-green-900/30 rounded-lg pl-9 pr-3 py-2 text-white text-sm placeholder:text-gray-600 focus:border-green-500/50 outline-none"
                    />
                  </div>

                  <div className="relative">
                    <Gauge className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input
                      type="number"
                      value={potenciaTerm}
                      onChange={(e) => setPotenciaTerm(e.target.value)}
                      placeholder={getText(
                        "Potencia (W) - ej: 500, 1000, 2000",
                        "Power (W) - eg: 500, 1000, 2000",
                        "Ισχύς (W) - π.χ: 500, 1000, 2000"
                      )}
                      className="w-full bg-black/50 border border-green-900/30 rounded-lg pl-9 pr-3 py-2 text-white text-sm placeholder:text-gray-600 focus:border-green-500/50 outline-none"
                    />
                  </div>

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Euro className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                      <input
                        type="number"
                        value={priceMin}
                        onChange={(e) => setPriceMin(Number(e.target.value))}
                        placeholder={getText("Mínimo", "Min", "Ελάχιστο")}
                        className="w-full bg-black/50 border border-green-900/30 rounded-lg pl-8 pr-2 py-2 text-white text-sm"
                      />
                    </div>
                    <span className="text-gray-500 text-sm">-</span>
                    <div className="relative flex-1">
                      <Euro className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                      <input
                        type="number"
                        value={priceMax}
                        onChange={(e) => setPriceMax(Number(e.target.value))}
                        placeholder={getText("Máximo", "Max", "Μέγιστο")}
                        className="w-full bg-black/50 border border-green-900/30 rounded-lg pl-8 pr-2 py-2 text-white text-sm"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {hasActiveFilters && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {searchTerm && (
                    <span className="bg-green-500/20 text-green-500 text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Search size={10} /> {searchTerm}
                      <button onClick={() => setSearchTerm("")}>×</button>
                    </span>
                  )}
                  {colorTerm && (
                    <span className="bg-green-500/20 text-green-500 text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Palette size={10} /> {colorTerm}
                      <button onClick={() => setColorTerm("")}>×</button>
                    </span>
                  )}
                  {potenciaTerm && (
                    <span className="bg-green-500/20 text-green-500 text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Gauge size={10} /> {potenciaTerm}W
                      <button onClick={() => setPotenciaTerm("")}>×</button>
                    </span>
                  )}
                  {(priceMin > 0 || priceMax < 5000) && (
                    <span className="bg-green-500/20 text-green-500 text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Euro size={10} /> {priceMin}€ - {priceMax}€
                      <button onClick={() => { setPriceMin(0); setPriceMax(5000); }}>×</button>
                    </span>
                  )}
                </div>
              )}
            </div>

            {searching && hasActiveFilters && (
              <div className="flex items-center justify-center gap-2 mt-2">
                <Loader2 size={12} className="animate-spin text-green-500" />
                <span className="text-[10px] text-gray-500">{getText("Buscando...", "Searching...", "Αναζήτηση...")}</span>
              </div>
            )}
          </div>

          {/* Resultados */}
          <div className="flex-1 overflow-y-auto p-4 bg-black">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={24} className="animate-spin text-green-500" />
              </div>
            ) : (
              <>
                {hasActiveFilters && (
                  <>
                    {/* Resultados exactos */}
                    {exactResults.length > 0 && (
                      <>
                        <div className="mb-3">
                          <p className="text-gray-500 text-xs">
                            {exactResults.length} {getText("resultados", "results", "αποτελέσματα")}
                            {hasActiveFilters && (
                              <button
                                onClick={handleClearSearch}
                                className="ml-2 text-green-500 text-[10px] hover:underline"
                              >
                                {getText("Limpiar", "Clear", "Εκκαθάριση")}
                              </button>
                            )}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                          {exactResults.map((product) => (
                            <motion.div
                              key={product.id}
                              whileHover={{ scale: 1.02 }}
                              onClick={() => handleProductClick(product.id)}
                              className="bg-[#0a0a0a] rounded-lg overflow-hidden cursor-pointer hover:shadow-[0_0_15px_rgba(46,204,113,0.2)] transition-all border border-green-900/30 hover:border-green-500/50 group"
                            >
                              <div className="aspect-square overflow-hidden bg-gray-800">
                                <img src={product.imagenes[0]} alt={product.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                              </div>
                              <div className="p-2">
                                <h3 className="text-white font-medium text-xs line-clamp-2 mb-1">
                                  {getTranslatedText(lang, product.nombre, product.nombre_en || product.nombre, product.nombre_gr || product.nombre)}
                                </h3>
                                <div className="flex items-center justify-between">
                                  <span className="text-green-500 font-bold text-sm">{product.precio}€</span>
                                  {product.rebaja && product.descuento && (
                                    <span className="bg-red-500 text-white text-[9px] px-1 py-0.5 rounded">-{product.descuento}%</span>
                                  )}
                                </div>
                                {product.variantes && product.variantes.length > 0 && (
                                  <div className="flex gap-0.5 mt-1">
                                    {product.variantes.slice(0, 3).map((v, idx) => (
                                      <div key={idx} className="w-2 h-2 rounded-full border border-gray-600" style={{ backgroundColor: v.codigoColor || "#888888" }} />
                                    ))}
                                    {product.variantes.length > 3 && <span className="text-[7px] text-gray-500">+{product.variantes.length - 3}</span>}
                                  </div>
                                )}
                                {getProductPotencia(product) > 0 && (
                                  <p className="text-[9px] text-gray-500 mt-1 flex items-center gap-1">
                                    <Gauge size={8} /> {getProductPotencia(product)}W
                                  </p>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </>
                    )}

                    {/* PRODUCTOS SIMILARES - SIEMPRE debajo de los resultados exactos */}
                    {similarProducts.length > 0 && (
                      <div className="mt-6 pt-4 border-t border-green-900/30">
                        <div className="mb-3">
                          <p className="text-gray-500 text-xs flex items-center gap-1">
                            <Sparkles size={12} className="text-green-500" />
                            {getText("Productos similares", "Similar products", "Παρόμοια προϊόντα")}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                          {similarProducts.map((product) => (
                            <motion.div
                              key={product.id}
                              whileHover={{ scale: 1.02 }}
                              onClick={() => handleProductClick(product.id)}
                              className="bg-[#0a0a0a] rounded-lg overflow-hidden cursor-pointer hover:shadow-[0_0_15px_rgba(46,204,113,0.2)] transition-all border border-green-900/30 hover:border-green-500/50 group"
                            >
                              <div className="aspect-square overflow-hidden bg-gray-800">
                                <img src={product.imagenes[0]} alt={product.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                              </div>
                              <div className="p-2">
                                <h3 className="text-white font-medium text-xs line-clamp-2 mb-1">
                                  {getTranslatedText(lang, product.nombre, product.nombre_en || product.nombre, product.nombre_gr || product.nombre)}
                                </h3>
                                <div className="flex items-center justify-between">
                                  <span className="text-green-500 font-bold text-sm">{product.precio}€</span>
                                  {product.rebaja && product.descuento && (
                                    <span className="bg-red-500 text-white text-[9px] px-1 py-0.5 rounded">-{product.descuento}%</span>
                                  )}
                                </div>
                                {getProductPotencia(product) > 0 && (
                                  <p className="text-[9px] text-gray-500 mt-1 flex items-center gap-1">
                                    <Gauge size={8} /> {getProductPotencia(product)}W
                                  </p>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sin resultados exactos y sin similares */}
                    {exactResults.length === 0 && similarProducts.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Search size={40} className="text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-400 text-sm">
                          {getText("No encontramos productos con esos criterios", "No products match these criteria", "Δεν βρέθηκαν προϊόντα με αυτά τα κριτήρια")}
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                          {getText("Prueba con otros valores o ajusta los filtros", "Try different values or adjust filters", "Δοκιμάστε άλλες τιμές ή προσαρμόστε τα φίλτρα")}
                        </p>
                        <div className="flex gap-2 mt-4">
                          <a href={`viber://contact?number=${viberNumber}`} onClick={(e) => { e.preventDefault(); window.open(`https://msng.link/vi/${viberNumber}`, '_blank'); }} className="flex items-center gap-1 bg-purple-600 text-white px-3 py-1.5 rounded-full text-xs">
                            <MessageCircle size={12} /> Viber
                          </a>
                          <a href={`mailto:${email}`} className="flex items-center gap-1 bg-gray-700 text-white px-3 py-1.5 rounded-full text-xs">
                            <Mail size={12} /> Email
                          </a>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {!hasActiveFilters && (
                  <div className="flex items-center justify-center h-full text-center py-12">
                    <div>
                      <Search size={40} className="text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">
                        {getText("Completa los campos para buscar", "Fill in the fields to search", "Συμπληρώστε τα πεδία για αναζήτηση")}
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SmartSearch;