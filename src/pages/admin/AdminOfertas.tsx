import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Navigate } from "react-router-dom";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
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
    if (Object.keys(originalData).length > 0) {
      const changed = JSON.stringify(ofertas) !== JSON.stringify(originalData);
      setHasChanges(changed);
    }
  }, [ofertas, originalData]);

  // Filtrar productos cuando cambia el término de búsqueda
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
      const productos = productSnap.docs.map(d => ({ id: d.id, ...d.data() } as Product));  
      setProducts(productos);
      setFilteredProducts(productos);

      const configSnap = await getDocs(collection(db, "configuracion"));
      const config = configSnap.docs.find(d => d.id === "ofertas");
      let data = {};

      if (config?.exists()) {
        data = config.data().productos || {};
      } else {
        productos.forEach(p => {
          data = { ...data, [p.id]: { activo: false, descuento: 0 } };
        });
      }

      setOfertas(data);
      setOriginalData(data);
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
    setOfertas(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        activo: !prev[productId]?.activo
      }
    }));
  };

  const handleDescuentoChange = (productId: string, descuento: number) => {
    setOfertas(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        descuento: Math.min(100, Math.max(0, descuento))
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "configuracion", "ofertas"), {
        productos: ofertas,
        updatedAt: new Date()
      });
      setOriginalData(ofertas);
      setHasChanges(false);
      toast({
        title: "Éxito",
        description: "Ofertas guardadas correctamente",
        className: "bg-green-500 text-white",
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
    setOfertas(originalData);
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

  // Contadores para el header
  const totalOfertasActivas = Object.values(ofertas).filter(o => o.activo).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header con navegación */}
        <div className="mb-8">
          <AdminNavBack
            title={getText('Ofertas y Descuentos', 'Offers & Discounts', 'Προσφορές & Εκπτώσεις')}
            description={getText('Configura promociones especiales', 'Configure special promotions', 'Διαμόρφωση προσφορών')}
          />

          <div className="mt-4 flex flex-col sm:flex-row justify-end gap-3">
            {hasChanges && (
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
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
                  ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-green-500/30 animate-pulse'
                  : 'bg-slate-700 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Save size={20} />
              <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
              {hasChanges && !saving && (
                <span className="w-2 h-2 bg-white rounded-full animate-ping ml-2" />        
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

        {loading ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400">{getText('Cargando...', 'Loading...', 'Φόρτωση...')}</p>
          </div>
        ) : (
          <>
            {/* Buscador y contador */}
            <div className="mb-6 bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="text"
                    placeholder={getText('Buscar productos...', 'Search products...', 'Αναζήτηση προϊόντων...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-10 pr-10 py-3 text-white placeholder:text-slate-500 outline-none focus:border-primary/50 transition-all"
                  />
                  {searchTerm && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-slate-400">Total:</span>
                  <span className="text-white font-bold">{filteredProducts.length}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-400">Ofertas activas:</span>
                  <span className="text-green-500 font-bold">{totalOfertasActivas}</span>
                </div>
              </div>
            </div>

            {/* Lista de productos */}
            <div className="space-y-4">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-16 bg-slate-800/30 rounded-xl border border-slate-700/50">
                  <Search size={48} className="text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 text-lg">
                    {searchTerm 
                      ? getText('No se encontraron productos', 'No products found', 'Δεν βρέθηκαν προϊόντα')
                      : getText('No hay productos disponibles', 'No products available', 'Δεν υπάρχουν διαθέσιμα προϊόντα')}
                  </p>
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-xl border border-slate-700/50 hover:border-primary/30 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Imagen */}
                      {product.imagenes?.[0] && (
                        <img
                          src={product.imagenes[0]}
                          alt={product.nombre}
                          className="w-full sm:w-20 h-48 sm:h-20 object-cover rounded-lg"
                        />
                      )}
                      
                      {/* Información del producto */}
                      <div className="flex-1">
                        <h3 className="font-display font-bold text-white text-lg sm:text-base">{product.nombre}</h3>
                        <p className="text-primary font-bold text-lg sm:text-base">€{product.precio}</p>
                        <p className="text-sm text-slate-400 capitalize mb-3 sm:mb-2">{product.categoria}</p>
                        
                        {/* Checkbox debajo de la info */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={ofertas[product.id]?.activo || false}
                              onChange={() => toggleOferta(product.id)}
                              className="accent-primary w-5 h-5"
                            />
                            <span className="text-sm text-white">En oferta</span>
                          </label>
                        </div>

                        {/* Panel de descuento */}
                        {ofertas[product.id]?.activo && (
                          <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 bg-slate-900/50 rounded-lg">
                            <Tag size={16} className="text-primary hidden sm:block" />
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                              <span className="text-sm text-slate-300">Descuento:</span>        
                              <input
                                type="number"
                                value={ofertas[product.id]?.descuento || 0}
                                onChange={(e) => handleDescuentoChange(product.id, parseInt(e.target.value) || 0)}
                                className="w-20 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-white"
                                min="0"
                                max="100"
                              />
                              <span className="text-sm text-white">%</span>
                            </div>
                            <div className="text-sm text-primary w-full sm:w-auto text-right">
                              Precio final: €{(product.precio * (1 - (ofertas[product.id]?.descuento || 0) / 100)).toFixed(2)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminOfertas;