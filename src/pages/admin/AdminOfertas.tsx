import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Navigate } from "react-router-dom";
import { collection, getDocs, doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import AdminNavBack from "@/components/AdminNavBack";
import { Save, Tag, AlertCircle, RefreshCw, Search, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Product {
  id: string;
  nombre: string;
  precio: number;
  categoria: string;
  imagenes: string[];
  rebaja?: boolean;
  descuento?: number;
}

const AdminOfertas = () => {
  const { user, isAdmin } = useAuth();
  const { t, lang } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [ofertas, setOfertas] = useState<Record<string, { activo: boolean; descuento: number }>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] = useState<Record<string, { activo: boolean; descuento: number }>>({});

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!loading && Object.keys(originalData).length > 0) {
      const changed = JSON.stringify(ofertas) !== JSON.stringify(originalData);
      console.log("🔍 Comparando cambios en ofertas:", { 
        changed, 
        ofertasKeys: Object.keys(ofertas).length,
        originalKeys: Object.keys(originalData).length
      });
      setHasChanges(changed);
    } else if (!loading && Object.keys(originalData).length === 0 && Object.keys(ofertas).length > 0) {
      console.log("🔍 Original vacío, hay ofertas cargadas - hay cambios");
      setHasChanges(true);
    }
  }, [ofertas, originalData, loading]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProducts(products);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = products.filter(p => 
        p.nombre.toLowerCase().includes(term) ||
        p.categoria.toLowerCase().includes(term) ||
        p.precio.toString().includes(term)
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  const loadData = async () => {
    setLoading(true);
    try {
      const productSnap = await getDocs(collection(db, "productos"));
      const productos = productSnap.docs.map(d => ({ 
        id: d.id, 
        ...d.data(),
        rebaja: d.data().rebaja === true,
        descuento: d.data().descuento || 0
      } as Product));
      setProducts(productos);
      setFilteredProducts(productos);

      const configSnap = await getDocs(collection(db, "configuracion"));
      const config = configSnap.docs.find(d => d.id === "ofertas");
      
      let data = {};
      if (config?.exists()) {
        const configData = config.data();
        const { updatedAt, ...rest } = configData;
        data = rest;
      }

      setOfertas(data);
      setOriginalData(JSON.parse(JSON.stringify(data)));
      console.log("📦 Ofertas cargadas:", data);
      
    } catch (error) {
      console.error("Error cargando datos:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const toggleOferta = (productId: string) => {
    setOfertas(prev => {
      const nuevo = {
        ...prev,
        [productId]: {
          activo: !prev[productId]?.activo,
          descuento: prev[productId]?.descuento || 0
        }
      };
      console.log("🔄 Toggle oferta:", { productId, nuevo: nuevo[productId] });
      return nuevo;
    });
  };

  const handleDescuentoChange = (productId: string, descuento: number) => {
    setOfertas(prev => {
      const nuevo = {
        ...prev,
        [productId]: {
          activo: prev[productId]?.activo || false,
          descuento: Math.min(100, Math.max(0, descuento))
        }
      };
      console.log("🔄 Cambio descuento:", { productId, nuevo: nuevo[productId] });
      return nuevo;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      console.log("💾 Guardando ofertas:", ofertas);
      
      await setDoc(doc(db, "configuracion", "ofertas"), {
        ...ofertas,
        updatedAt: new Date()
      });
      
      for (const [productId, oferta] of Object.entries(ofertas)) {
        const productRef = doc(db, "productos", productId);
        await updateDoc(productRef, {
          rebaja: oferta.activo,
          descuento: oferta.descuento
        });
        console.log(`✅ Producto ${productId} actualizado`);
      }
      
      setOriginalData(JSON.parse(JSON.stringify(ofertas)));
      setHasChanges(false);
      
      toast({
        title: "Éxito",
        description: "Ofertas guardadas correctamente",
        className: "bg-purple-500 text-white",
      });
    } catch (error) {
      console.error("Error guardando:", error);
      toast({
        title: "Error",
        description: "No se pudieron guardar las ofertas",
        variant: "destructive",
      });
    }
    setSaving(false);
  };

  const handleReset = () => {
    setOfertas(JSON.parse(JSON.stringify(originalData)));
    toast({
      title: "Cambios descartados",
      description: "Se restauró la configuración anterior",
    });
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  if (!user || !isAdmin) return <Navigate to="/admin" replace />;

  const getText = (es: string, en: string, gr: string) => {
    if (lang === 'en') return en;
    if (lang === 'gr') return gr;
    return es;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <AdminNavBack
            title={getText('Ofertas y Descuentos', 'Offers & Discounts', 'Προσφορές & Εκπτώσεις')}
            description={getText('Configura promociones especiales', 'Configure special promotions', 'Διαμόρφωση προσφορών')}
          />

          <div className="mt-4 flex flex-col sm:flex-row justify-end gap-3">
            {hasChanges && (
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-black/50 text-white rounded-xl hover:bg-purple-500/10 transition-all flex items-center justify-center gap-2 text-sm sm:text-base border border-purple-900/30"
              >
                <RefreshCw size={18} />
                <span className="hidden sm:inline">Descartar</span>
              </button>
            )}

            <button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className={`px-8 py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-base sm:text-lg font-bold shadow-lg ${
                hasChanges
                  ? 'bg-purple-500/20 text-purple-500 hover:bg-purple-500/30 border border-purple-500/30 shadow-[0_0_15px_rgba(147,51,234,0.3)] animate-pulse'
                  : 'bg-black/50 text-gray-500 cursor-not-allowed border border-purple-900/30'
              }`}
            >
              <Save size={20} />
              <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
              {hasChanges && !saving && (
                <span className="w-2 h-2 bg-purple-500 rounded-full animate-ping ml-2" />
              )}
            </button>
          </div>

          {hasChanges && (
            <div className="mt-4 flex items-center gap-2 text-yellow-500 bg-yellow-500/10 p-3 rounded-xl border border-yellow-500/20">
              <AlertCircle size={16} />
              <span className="text-sm">Tienes cambios sin guardar</span>
            </div>
          )}
        </div>

        <div className="mb-6 bg-[#0a0a0a] rounded-2xl p-4 border border-purple-900/30 hover:border-purple-500/50 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:shadow-[0_0_25px_rgba(147,51,234,0.2)]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder={getText('Buscar productos...', 'Search products...', 'Αναζήτηση προϊόντων...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/50 border border-purple-900/30 rounded-xl pl-10 pr-10 py-3 text-white placeholder:text-gray-600 outline-none focus:border-purple-500/50 transition-all"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">{getText('Cargando...', 'Loading...', 'Φόρτωση...')}</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-[#0a0a0a] rounded-2xl border border-purple-900/30">
            <Tag size={64} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-2">
              {getText('No hay productos en oferta', 'No products on sale', 'Δεν υπάρχουν προϊόντα σε προσφορά')}
            </p>
            <p className="text-gray-500 text-sm">
              {searchTerm 
                ? getText(`No se encontraron productos para "${searchTerm}"`, `No products found for "${searchTerm}"`, `Δεν βρέθηκαν προϊόντα για "${searchTerm}"`)
                : getText('Selecciona productos para crear ofertas', 'Select products to create offers', 'Επιλέξτε προϊόντα για δημιουργία προσφορών')}
            </p>
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="mt-4 px-4 py-2 bg-purple-500/20 text-purple-500 rounded-lg hover:bg-purple-500/30 transition-all"
              >
                {getText('Limpiar búsqueda', 'Clear search', 'Εκκαθάριση αναζήτησης')}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProducts.map((product) => {
              const oferta = ofertas[product.id];
              const activo = oferta?.activo || false;
              const descuento = oferta?.descuento || 0;

              return (
                <div
                  key={product.id}
                  className="bg-[#0a0a0a] p-4 rounded-xl border border-purple-900/30 hover:border-purple-500/50 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:shadow-[0_0_25px_rgba(147,51,234,0.2)]"
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    {product.imagenes?.[0] && (
                      <img
                        src={product.imagenes[0]}
                        alt={product.nombre}
                        className="w-full sm:w-20 h-48 sm:h-20 object-cover rounded-lg"
                      />
                    )}
                    
                    <div className="flex-1">
                      <h3 className="font-display font-bold text-white text-lg sm:text-base">{product.nombre}</h3>
                      <p className="text-purple-500 font-bold text-lg sm:text-base">€{product.precio}</p>
                      <p className="text-sm text-gray-500 capitalize mb-3 sm:mb-2">{product.categoria}</p>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={activo}
                            onChange={() => toggleOferta(product.id)}
                            className="accent-purple-500 w-5 h-5"
                          />
                          <span className="text-sm text-white">En oferta</span>
                        </label>
                      </div>

                      {activo && (
                        <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 bg-black/50 rounded-lg border border-purple-900/30">
                          <Tag size={16} className="text-purple-500 hidden sm:block" />
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <span className="text-sm text-gray-400">Descuento:</span>
                            <input
                              type="number"
                              value={descuento}
                              onChange={(e) => handleDescuentoChange(product.id, parseInt(e.target.value) || 0)}
                              className="w-20 bg-black/50 border border-purple-900/30 rounded-lg px-2 py-1 text-white"
                              min="0"
                              max="100"
                            />
                            <span className="text-sm text-white">%</span>
                          </div>
                          <div className="text-sm text-purple-500 w-full sm:w-auto text-right">
                            Precio final: €{(product.precio * (1 - descuento / 100)).toFixed(2)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOfertas;