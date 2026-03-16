import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Navigate } from "react-router-dom";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import AdminNavBack from "@/components/AdminNavBack";
import { Save, Star, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Product {
  id: string;
  nombre: string;
  precio: number;
  categoria: string;
  imagenes: string[];
}

const AdminMasVendidos = () => {
  const { user, isAdmin } = useAuth();
  const { t, lang } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [masVendidos, setMasVendidos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (originalData.length > 0) {
      const changed = JSON.stringify(masVendidos) !== JSON.stringify(originalData);
      console.log("📊 ¿Hay cambios?", changed, "Original:", originalData, "Actual:", masVendidos);
      setHasChanges(changed);
    }
  }, [masVendidos, originalData]);

  const loadData = async () => {
    setLoading(true);
    try {
      const productSnap = await getDocs(collection(db, "productos"));
      const productos = productSnap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
      setProducts(productos);

      const configSnap = await getDocs(collection(db, "configuracion"));
      const config = configSnap.docs.find(d => d.id === "masVendidos");
      
      let data: string[] = [];
      if (config?.exists()) {
        data = config.data().productos || [];
        console.log("📊 Datos cargados:", data);
      } else {
        console.log("📊 No hay configuración, se usará array vacío");
      }
      
      setMasVendidos(data);
      setOriginalData(data);
    } catch (error) {
      console.error("Error cargando datos:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      });
      setMasVendidos([]);
      setOriginalData([]);
    }
    setLoading(false);
  };

  const toggleProduct = (productId: string) => {
    setMasVendidos(prev => {
      const newList = prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId];
      
      console.log("🔄 Productos seleccionados:", newList);
      return newList;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "configuracion", "masVendidos"), {
        productos: masVendidos,
        updatedAt: new Date()
      });
      setOriginalData(masVendidos);
      setHasChanges(false);
      toast({
        title: "Éxito",
        description: "Productos destacados guardados correctamente",
        className: "bg-green-500 text-white",
      });
      console.log("✅ Guardado exitoso:", masVendidos);
    } catch (error) {
      console.error("Error guardando:", error);
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios",
        variant: "destructive",
      });
    }
    setSaving(false);
  };

  const handleReset = () => {
    setMasVendidos(originalData);
    toast({
      title: "Cambios descartados",
      description: "Se restauró la configuración anterior",
    });
  };

  if (!user || !isAdmin) return <Navigate to="/admin" replace />;

  const getText = (es: string, en: string, gr: string) => {
    if (lang === 'en') return en;
    if (lang === 'gr') return gr;
    return es;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header con navegación */}
        <div className="mb-8">
          <AdminNavBack
            title={getText('Productos Destacados', 'Featured Products', 'Προβεβλημένα Προϊόντα')}
            description={getText('Selecciona los productos más vendidos', 'Select best-selling products', 'Επιλέξτε δημοφιλή προϊόντα')}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className={`p-4 rounded-xl cursor-pointer transition-all border-2 ${
                  masVendidos.includes(product.id)
                    ? 'border-yellow-500 bg-yellow-500/10 shadow-lg shadow-yellow-500/20'
                    : 'border-slate-700 bg-slate-800/50 hover:border-primary/30'
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
                      {masVendidos.includes(product.id) && (
                        <Star size={16} className="text-yellow-500 fill-yellow-500" />
                      )}
                    </div>
                    <p className="text-primary font-bold">€{product.precio}</p>
                    <p className="text-sm text-slate-400 capitalize">{product.categoria}</p>
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