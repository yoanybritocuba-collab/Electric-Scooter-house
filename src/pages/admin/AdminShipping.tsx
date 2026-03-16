import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Navigate } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { Save, Truck, Euro, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ShippingConfig {
  freeShippingEnabled: boolean;
  freeShippingMinAmount: number;
  shippingCost: number;
}

const AdminShipping = () => {
  const { user, isAdmin } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<ShippingConfig>({
    freeShippingEnabled: true,
    freeShippingMinAmount: 50,
    shippingCost: 5
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const docRef = doc(db, "configuracion", "shipping");
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setConfig(docSnap.data() as ShippingConfig);
      }
    } catch (error) {
      console.error("Error cargando configuración:", error);
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
      toast({
        title: "Éxito",
        description: "Configuración de envío guardada correctamente",
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

  if (!user || !isAdmin) return <Navigate to="/admin" replace />;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4 lg:px-8">
        <div className="bg-gray-900 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <Truck size={28} className="text-primary" />
            <h1 className="font-display font-bold text-2xl text-white">
              Configuración de Envío
            </h1>
          </div>

          {loading ? (
            <div className="text-center py-8">Cargando...</div>
          ) : (
            <div className="space-y-6">
              {/* Activar/Desactivar envío gratis */}
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-white font-medium">Envío Gratis</label>
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
                <p className="text-sm text-gray-400">
                  Activa o desactiva la opción de envío gratis
                </p>
              </div>

              {/* Monto mínimo para envío gratis */}
              {config.freeShippingEnabled && (
                <div className="bg-gray-800 rounded-lg p-4">
                  <label className="block text-white font-medium mb-2">
                    Monto mínimo para envío gratis (€)
                  </label>
                  <div className="relative">
                    <Euro size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={config.freeShippingMinAmount}
                      onChange={(e) => setConfig({
                        ...config,
                        freeShippingMinAmount: parseFloat(e.target.value) || 0
                      })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    Los pedidos superiores a este importe tendrán envío gratis
                  </p>
                </div>
              )}

              {/* Costo de envío normal */}
              <div className="bg-gray-800 rounded-lg p-4">
                <label className="block text-white font-medium mb-2">
                  Costo de envío normal (€)
                </label>
                <div className="relative">
                  <Euro size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={config.shippingCost}
                    onChange={(e) => setConfig({
                      ...config,
                      shippingCost: parseFloat(e.target.value) || 0
                    })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white outline-none focus:border-primary transition-colors"
                  />
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  Costo cuando no aplica envío gratis
                </p>
              </div>

              {/* Botón guardar */}
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-primary text-white py-3 rounded-lg hover:bg-glow transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save size={18} />
                {saving ? "Guardando..." : "Guardar Configuración"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminShipping;