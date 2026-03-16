import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Navigate } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import AdminNavBack from "@/components/AdminNavBack";
import { Save, Truck, Euro, ToggleLeft, ToggleRight, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ShippingConfig {
  freeShippingEnabled: boolean;
  freeShippingMinAmount: number;
  shippingCost: number;
}

const AdminShipping = () => {
  const { user, isAdmin } = useAuth();
  const { t, lang } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] = useState<ShippingConfig | null>(null);
  const [config, setConfig] = useState<ShippingConfig>({
    freeShippingEnabled: true,
    freeShippingMinAmount: 50,
    shippingCost: 5
  });

  useEffect(() => {
    loadConfig();
  }, []);

  useEffect(() => {
    if (originalData) {
      const changed = JSON.stringify(config) !== JSON.stringify(originalData);
      setHasChanges(changed);
    }
  }, [config, originalData]);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, "configuracion", "shipping");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as ShippingConfig;
        setConfig(data);
        setOriginalData(data);
      } else {
        setOriginalData(config);
      }
    } catch (error) {
      console.error("Error cargando configuración:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar la configuración",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "configuracion", "shipping"), {
        ...config,
        updatedAt: new Date()
      });
      setOriginalData(config);
      setHasChanges(false);
      toast({
        title: "Éxito",
        description: "Configuración guardada correctamente",
        className: "bg-green-500 text-white",
      });
    } catch (error) {
      console.error("Error guardando:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración",
        variant: "destructive",
      });
    }
    setSaving(false);
  };

  const handleReset = () => {
    if (originalData) {
      setConfig(originalData);
      toast({
        title: "Cambios descartados",
        description: "Se restauró la configuración anterior",
      });
    }
  };

  if (!user || !isAdmin) return <Navigate to="/admin" replace />;

  const getText = (es: string, en: string, gr: string) => {
    if (lang === 'en') return en;
    if (lang === 'gr') return gr;
    return es;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header con navegación */}
        <div className="mb-8">
          <AdminNavBack 
            title={getText('Configuración de Envíos', 'Shipping Settings', 'Ρυθμίσεις Αποστολής')}
            description={getText('Gastos y condiciones de envío', 'Shipping costs and conditions', 'Κόστος και όροι αποστολής')}
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
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <div className="space-y-6">
              {/* Activar/Desactivar envío gratis */}
              <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-white font-medium">{getText('Envío Gratis', 'Free Shipping', 'Δωρεάν Αποστολή')}</label>
                  <button
                    onClick={() => setConfig({
                      ...config,
                      freeShippingEnabled: !config.freeShippingEnabled
                    })}
                    className="text-primary"
                  >
                    {config.freeShippingEnabled ? (
                      <ToggleRight size={32} />
                    ) : (
                      <ToggleLeft size={32} />
                    )}
                  </button>
                </div>
                <p className="text-sm text-slate-400">
                  {getText('Activa o desactiva la opción de envío gratis', 'Enable or disable free shipping', 'Ενεργοποίηση ή απενεργοποίηση δωρεάν αποστολής')}
                </p>
              </div>

              {/* Monto mínimo para envío gratis */}
              {config.freeShippingEnabled && (
                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
                  <label className="block text-white font-medium mb-2">
                    {getText('Monto mínimo para envío gratis (€)', 'Minimum amount for free shipping (€)', 'Ελάχιστο ποσό για δωρεάν αποστολή (€)')}
                  </label>
                  <div className="relative">
                    <Euro size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={config.freeShippingMinAmount}
                      onChange={(e) => setConfig({
                        ...config,
                        freeShippingMinAmount: parseFloat(e.target.value) || 0
                      })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white outline-none focus:border-primary/50 transition-all"
                    />
                  </div>
                  <p className="text-sm text-slate-400 mt-2">
                    {getText('Pedidos superiores a este importe tendrán envío gratis', 'Orders above this amount get free shipping', 'Παραγγελίες άνω αυτού του ποσού έχουν δωρεάν αποστολή')}
                  </p>
                </div>
              )}

              {/* Costo de envío normal */}
              <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
                <label className="block text-white font-medium mb-2">
                  {getText('Costo de envío normal (€)', 'Standard shipping cost (€)', 'Κανονικό κόστος αποστολής (€)')}
                </label>
                <div className="relative">
                  <Euro size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={config.shippingCost}
                    onChange={(e) => setConfig({
                      ...config,
                      shippingCost: parseFloat(e.target.value) || 0
                    })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white outline-none focus:border-primary/50 transition-all"
                  />
                </div>
                <p className="text-sm text-slate-400 mt-2">
                  {getText('Costo cuando no aplica envío gratis', 'Cost when free shipping does not apply', 'Κόστος όταν δεν ισχύει δωρεάν αποστολή')}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminShipping;