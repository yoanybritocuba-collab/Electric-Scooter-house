import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Navigate } from "react-router-dom";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import AdminNavBack from "@/components/AdminNavBack";
import { Save, Star, AlertCircle, RefreshCw, Search, X, Package } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Product {
  id: string;
  nombre: string;
  precio: number;
  categoria: string;
  imagenes: string[];
  masVendido?: boolean;
}

const AdminMasVendidos = () => {
  const { user, isAdmin } = useAuth();
  const { t, lang } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      const originalIds = products.filter(p => p.masVendido).map(p => p.id);
      const changed = JSON.stringify(selectedIds) !== JSON.stringify(originalIds);
      setHasChanges(changed);
    }
  }, [selectedIds, products]);

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
        masVendido: d.data().masVendido === true 
      } as Product));
      
      setProducts(productos);
      setFilteredProducts(productos);
      
      const idsSeleccionados = productos.filter(p => p.masVendido).map(p => p.id);
      setSelectedIds(idsSeleccionados);
      
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

  const toggleProduct = (productId: string) => {
    setSelectedIds(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let updatedCount = 0;
      
      for (const product of products) {
        const deberiaEstarSeleccionado = selectedIds.includes(product.id);
        
        if (product.masVendido !== deberiaEstarSeleccionado) {
          const productRef = doc(db, "productos", product.id);
          await updateDoc(productRef, {
            masVendido: deberiaEstarSeleccionado
          });
          updatedCount++;
        }
      }
      
      await loadData();
      
      toast({
        title: "Éxito",
        description: `${updatedCount} productos destacados guardados correctamente`,
        className: "bg-green-500 text-white",
      });
      
    } catch (error: any) {
      console.error("Error guardando:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudieron guardar los cambios",
        variant: "destructive",
      });
    }
    setSaving(false);
  };

  const handleReset = () => {
    const originalIds = products.filter(p => p.masVendido).map(p => p.id);
    setSelectedIds(originalIds);
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
            title={getText('Productos Destacados', 'Featured Products', 'Προβεβλημένα Προϊόντα')}
            description={getText('Selecciona los productos más vendidos', 'Select best-selling products', 'Επιλέξτε δημοφιλή προϊόντα')}
          />

          <div className="mt-4 flex flex-col sm:flex-row justify-end gap-3">
            {hasChanges && (
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-black/50 text-white rounded-xl hover:bg-green-500/10 transition-all flex items-center justify-center gap-2 text-sm sm:text-base border border-green-900/30"
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
                  ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30 border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.3)] animate-pulse'
                  : 'bg-black/50 text-gray-500 cursor-not-allowed border border-green-900/30'
              }`}
            >
              <Save size={20} />
              <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
              {hasChanges && !saving && (
                <span className="w-2 h-2 bg-green-500 rounded-full animate-ping ml-2" />
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

        <div className="mb-6 bg-[#0a0a0a] rounded-2xl p-4 border border-green-900/30 hover:border-green-500/50 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:shadow-[0_0_25px_rgba(34,197,94,0.2)]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder={getText('Buscar productos...', 'Search products...', 'Αναζήτηση προϊόντων...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/50 border border-green-900/30 rounded-xl pl-10 pr-10 py-3 text-white placeholder:text-gray-600 outline-none focus:border-green-500/50 transition-all"
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
            <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">{getText('Cargando...', 'Loading...', 'Φόρτωση...')}</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-[#0a0a0a] rounded-2xl border border-green-900/30">
            <Package size={64} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-2">
              {getText('No hay productos disponibles', 'No products available', 'Δεν υπάρχουν διαθέσιμα προϊόντα')}
            </p>
            <p className="text-gray-500 text-sm">
              {searchTerm 
                ? getText(`No se encontraron productos para "${searchTerm}"`, `No products found for "${searchTerm}"`, `Δεν βρέθηκαν προϊόντα για "${searchTerm}"`)
                : getText('No hay productos en esta sección', 'No products in this section', 'Δεν υπάρχουν προϊόντα σε αυτήν την ενότητα')}
            </p>
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="mt-4 px-4 py-2 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500/30 transition-all"
              >
                {getText('Limpiar búsqueda', 'Clear search', 'Εκκαθάριση αναζήτησης')}
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className={`p-4 rounded-xl cursor-pointer transition-all border-2 ${
                  selectedIds.includes(product.id)
                    ? 'border-yellow-500 bg-yellow-500/10 shadow-lg shadow-yellow-500/20'
                    : 'border-green-900/30 bg-[#0a0a0a] hover:border-green-500/50'
                }`}
                onClick={() => toggleProduct(product.id)}
              >
                <div className="flex gap-4">
                  {product.imagenes?.[0] && (
                    <img
                      src={product.imagenes[0]}
                      alt={product.nombre}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display font-bold text-white">{product.nombre}</h3>
                      {selectedIds.includes(product.id) && (
                        <Star size={16} className="text-yellow-500 fill-yellow-500" />
                      )}
                    </div>
                    <p className="text-green-500 font-bold">€{product.precio}</p>
                    <p className="text-sm text-gray-500 capitalize">{product.categoria}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMasVendidos;