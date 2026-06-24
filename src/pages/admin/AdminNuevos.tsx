import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Navigate } from "react-router-dom";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import AdminNavBack from "@/components/AdminNavBack";
import { Save, Sparkles, AlertCircle, RefreshCw, Search, X, Calendar } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Product {
  id: string;
  nombre: string;
  precio: number;
  categoria: string;
  imagenes: string[];
}

interface ProductoNuevo {
  activo: boolean;
  fechaInicio: Date;
  fechaFin: Date;
}

const AdminNuevos = () => {
  const { user, isAdmin } = useAuth();
  const { lang } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [nuevos, setNuevos] = useState<Record<string, ProductoNuevo>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] = useState<Record<string, ProductoNuevo>>({});

  const opcionesDuracion = [
    { label: "1 día", dias: 1 },
    { label: "3 días", dias: 3 },
    { label: "7 días", dias: 7 },
    { label: "15 días", dias: 15 },
    { label: "30 días", dias: 30 },
    { label: "60 días", dias: 60 },
    { label: "90 días", dias: 90 }
  ];

  useEffect(() => {
    loadData();
  }, []);

  // ===== DETECCIÓN DE CAMBIOS CORREGIDA =====
  useEffect(() => {
    if (!loading && Object.keys(originalData).length > 0) {
      const nuevosString = JSON.stringify(nuevos, (key, value) => {
        if (value instanceof Date) return value.toISOString();
        return value;
      });
      
      const originalString = JSON.stringify(originalData, (key, value) => {
        if (value instanceof Date) return value.toISOString();
        return value;
      });
      
      const changed = nuevosString !== originalString;
      console.log("🔍 Comparando cambios en nuevos:", { changed });
      setHasChanges(changed);
    } else if (!loading && Object.keys(originalData).length === 0 && Object.keys(nuevos).length > 0) {
      console.log("🔍 Original vacío, hay nuevos cargados - hay cambios");
      setHasChanges(true);
    }
  }, [nuevos, originalData, loading]);

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
        ...d.data()
      } as Product));
      setProducts(productos);
      setFilteredProducts(productos);

      const configSnap = await getDocs(collection(db, "configuracion"));
      const config = configSnap.docs.find(d => d.id === "nuevos");
      
      let data = {};
      if (config?.exists()) {
        data = config.data().productos || {};
        Object.keys(data).forEach(key => {
          if (data[key].fechaInicio) {
            if (data[key].fechaInicio.toDate) {
              data[key].fechaInicio = data[key].fechaInicio.toDate();
            } else {
              data[key].fechaInicio = new Date(data[key].fechaInicio);
            }
            data[key].fechaInicio.setHours(0, 0, 0, 0);
          }
          if (data[key].fechaFin) {
            if (data[key].fechaFin.toDate) {
              data[key].fechaFin = data[key].fechaFin.toDate();
            } else {
              data[key].fechaFin = new Date(data[key].fechaFin);
            }
            data[key].fechaFin.setHours(23, 59, 59, 999);
          }
        });
      }

      setNuevos(data);
      setOriginalData(JSON.parse(JSON.stringify(data, (key, value) => {
        if (value instanceof Date) return value.toISOString();
        return value;
      })));
      console.log("📦 Nuevos cargados:", data);
      
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

  const toggleProducto = (productId: string, activo: boolean) => {
    if (activo) {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const fin = new Date(hoy);
      fin.setDate(fin.getDate() + 30);
      fin.setHours(23, 59, 59, 999);
      
      setNuevos(prev => ({
        ...prev,
        [productId]: {
          activo: true,
          fechaInicio: hoy,
          fechaFin: fin
        }
      }));
    } else {
      const nuevosTemp = { ...nuevos };
      delete nuevosTemp[productId];
      setNuevos(nuevosTemp);
    }
  };

  const setDuracionPredefinida = (productId: string, dias: number) => {
    const inicio = nuevos[productId]?.fechaInicio || new Date();
    const fin = new Date(inicio);
    fin.setDate(fin.getDate() + dias);
    fin.setHours(23, 59, 59, 999);
    
    setNuevos(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        fechaFin: fin
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      console.log("💾 Guardando configuración de nuevos:", nuevos);
      
      const nuevosParaGuardar = JSON.parse(JSON.stringify(nuevos, (key, value) => {
        if (value instanceof Date) return value.toISOString();
        return value;
      }));
      
      await setDoc(doc(db, "configuracion", "nuevos"), {
        productos: nuevosParaGuardar,
        updatedAt: new Date()
      });
      
      setOriginalData(JSON.parse(JSON.stringify(nuevos, (key, value) => {
        if (value instanceof Date) return value.toISOString();
        return value;
      })));
      setHasChanges(false);
      
      toast({
        title: "Éxito",
        description: "Productos nuevos guardados correctamente",
        className: "bg-green-500 text-white",
      });
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
    setNuevos(JSON.parse(JSON.stringify(originalData, (key, value) => {
      if (value && typeof value === 'object' && value._seconds) return value;
      return value;
    })));
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
            title={getText('Lo Nuevo', 'New Arrivals', 'Νέα Αφίξεις')}
            description={getText('Gestiona productos nuevos con fecha de expiración', 'Manage new products with expiration date', 'Διαχείριση νέων προϊόντων με ημερομηνία λήξης')}
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
              <span className="text-sm">{getText('Tienes cambios sin guardar', 'You have unsaved changes', 'Έχετε μη αποθηκευμένες αλλαγές')}</span>
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
            <Sparkles size={64} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-2">
              {getText('No hay productos', 'No products', 'Δεν υπάρχουν προϊόντα')}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProducts.map((product) => {
              const esNuevo = nuevos[product.id]?.activo || false;
              const fechaInicio = nuevos[product.id]?.fechaInicio;
              const fechaFin = nuevos[product.id]?.fechaFin;

              return (
                <div
                  key={product.id}
                  className={`bg-[#0a0a0a] p-4 rounded-xl border transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] ${
                    esNuevo 
                      ? 'border-purple-500 bg-purple-500/10 hover:border-purple-400' 
                      : 'border-purple-900/30 hover:border-purple-500/50'
                  }`}
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
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-bold text-white text-lg sm:text-base">{product.nombre || 'Producto sin nombre'}</h3>
                        {esNuevo && (
                          <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                            <Sparkles size={12} />
                            {getText('LO NUEVO', 'NEW', 'ΝΕΟ')}
                          </span>
                        )}
                      </div>
                      <p className="text-purple-500 font-bold text-lg sm:text-base">€{product.precio}</p>
                      <p className="text-sm text-gray-500 capitalize mb-3 sm:mb-2">{product.categoria}</p>
                      
                      <div className="flex items-center gap-4 mb-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={esNuevo}
                            onChange={(e) => toggleProducto(product.id, e.target.checked)}
                            className="accent-purple-500 w-5 h-5"
                          />
                          <span className="text-sm text-white">{getText('Marcar como nuevo', 'Mark as new', 'Επισήμανση ως νέο')}</span>
                        </label>
                      </div>

                      {esNuevo && (
                        <div className="mt-4 p-4 bg-black/50 rounded-lg border border-purple-900/30">
                          <div className="flex items-center gap-2 mb-3">
                            <Calendar size={16} className="text-purple-500" />
                            <span className="text-sm text-gray-300">{getText('Configurar duración', 'Set duration', 'Ρύθμιση διάρκειας')}</span>
                          </div>
                          
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                            {opcionesDuracion.map(opcion => (
                              <button
                                key={opcion.dias}
                                onClick={() => setDuracionPredefinida(product.id, opcion.dias)}
                                className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 text-xs"
                              >
                                {opcion.label}
                              </button>
                            ))}
                          </div>

                          <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                              <label className="block text-xs text-gray-400 mb-1">{getText('Fecha inicio', 'Start date', 'Ημερομηνία έναρξης')}</label>
                              <input
                                type="date"
                                value={fechaInicio ? fechaInicio.toISOString().split('T')[0] : ''}
                                onChange={(e) => {
                                  const nuevaFecha = new Date(e.target.value);
                                  nuevaFecha.setHours(0, 0, 0, 0);
                                  setNuevos(prev => ({
                                    ...prev,
                                    [product.id]: {
                                      ...prev[product.id],
                                      fechaInicio: nuevaFecha
                                    }
                                  }));
                                }}
                                className="w-full bg-black/50 border border-purple-900/30 rounded-lg px-3 py-2 text-white text-sm"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="block text-xs text-gray-400 mb-1">{getText('Fecha fin', 'End date', 'Ημερομηνία λήξης')}</label>
                              <input
                                type="date"
                                value={fechaFin ? fechaFin.toISOString().split('T')[0] : ''}
                                onChange={(e) => {
                                  const nuevaFecha = new Date(e.target.value);
                                  nuevaFecha.setHours(23, 59, 59, 999);
                                  setNuevos(prev => ({
                                    ...prev,
                                    [product.id]: {
                                      ...prev[product.id],
                                      fechaFin: nuevaFecha
                                    }
                                  }));
                                }}
                                className="w-full bg-black/50 border border-purple-900/30 rounded-lg px-3 py-2 text-white text-sm"
                              />
                            </div>
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

export default AdminNuevos;