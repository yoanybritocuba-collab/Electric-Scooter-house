import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Navigate } from "react-router-dom";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { db, storage } from "@/firebase/config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import AdminNavBack from "@/components/AdminNavBack";
import { Save, Upload, X, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Categoria {
  id: string;
  nombre: string;
  descripcion: string;
  imagen: string;
  orden: number;
  activo: boolean;
}

const AdminCategorias = () => {
  const { user, isAdmin } = useAuth();
  const { t, lang } = useLanguage();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] = useState<Categoria[]>([]);

  const categoriaIds = [
    "patinetes", "bicicletas", "motos", "accesorios",
    "piezas", "infantiles", "movilidad-reducida"
  ];

  useEffect(() => {
    loadCategorias();
  }, []);

  useEffect(() => {
    if (originalData.length > 0) {
      const changed = JSON.stringify(categorias) !== JSON.stringify(originalData);
      setHasChanges(changed);
    }
  }, [categorias, originalData]);

  const loadCategorias = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "categorias"));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Categoria));

      const categoriasCompletas = categoriaIds.map(id => {
        const existente = data.find(c => c.id === id);
        return existente || {
          id,
          nombre: getNombreDefault(id),
          descripcion: getDescripcionDefault(id),
          imagen: "",
          orden: categoriaIds.indexOf(id) + 1,
          activo: true
        };
      }).sort((a, b) => a.orden - b.orden);

      setCategorias(categoriasCompletas);
      setOriginalData(categoriasCompletas);
    } catch (error) {
      console.error("Error cargando categorías:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las categorías",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const getNombreDefault = (id: string) => {
    const nombres: Record<string, string> = {
      patinetes: "Patinetes Eléctricos",
      bicicletas: "Bicicletas Eléctricas",
      motos: "Motos Eléctricas",
      accesorios: "Accesorios",
      piezas: "Piezas y Repuestos",
      infantiles: "Línea Infantil",
      "movilidad-reducida": "Movilidad Reducida"
    };
    return nombres[id] || id;
  };

  const getDescripcionDefault = (id: string) => {
    const descs: Record<string, string> = {
      patinetes: "Los mejores patinetes del mercado",
      bicicletas: "Bicicletas para todos los terrenos",
      motos: "Máxima potencia y autonomía",
      accesorios: "Cascos, guantes, candados, luces y más",
      piezas: "Todo lo que necesitas",
      infantiles: "Vehículos eléctricos para los más pequeños",
      "movilidad-reducida": "Sillas y scooters para movilidad asistida"
    };
    return descs[id] || "";
  };

  const handleChange = (id: string, field: keyof Categoria, value: any) => {
    setCategorias(prev =>
      prev.map(c => c.id === id ? { ...c, [field]: value } : c)
    );
  };

  const handleImageUpload = async (id: string, file: File) => {
    setUploading(id);
    try {
      const storageRef = ref(storage, `categorias/${id}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      handleChange(id, "imagen", url);
      toast({
        title: "Éxito",
        description: "Imagen subida correctamente",
      });
    } catch (error) {
      console.error("Error subiendo imagen:", error);
      toast({
        title: "Error",
        description: "No se pudo subir la imagen",
        variant: "destructive",
      });
    }
    setUploading(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const cat of categorias) {
        await setDoc(doc(db, "categorias", cat.id), {
          nombre: cat.nombre,
          descripcion: cat.descripcion,
          imagen: cat.imagen,
          orden: cat.orden,
          activo: cat.activo
        });
      }
      setOriginalData(categorias);
      setHasChanges(false);
      toast({
        title: "Éxito",
        description: "Categorías guardadas correctamente",
        className: "bg-purple-500 text-white",
      });
    } catch (error) {
      console.error("Error guardando:", error);
      toast({
        title: "Error",
        description: "No se pudieron guardar las categorías",
        variant: "destructive",
      });
    }
    setSaving(false);
  };

  const handleReset = () => {
    setCategorias(originalData);
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
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <AdminNavBack 
            title={getText('Gestionar Categorías', 'Manage Categories', 'Διαχείριση Κατηγοριών')}
            description={getText('Organiza y clasifica tus productos', 'Organize your products', 'Οργάνωση προϊόντων')}
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

        {loading ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">{getText('Cargando...', 'Loading...', 'Φόρτωση...')}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {categorias.map((cat) => (
              <div 
                key={cat.id} 
                className="bg-[#0a0a0a] rounded-2xl p-6 border border-purple-900/30 hover:border-purple-500/50 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:shadow-[0_0_25px_rgba(147,51,234,0.2)]"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">ID (fijo)</label>
                    <input
                      value={cat.id}
                      disabled
                      className="w-full bg-black/50 border border-purple-900/30 rounded-xl px-4 py-3 text-gray-500 opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Orden</label>
                    <input
                      type="number"
                      value={cat.orden}
                      onChange={(e) => handleChange(cat.id, "orden", parseInt(e.target.value))}
                      className="w-full bg-black/50 border border-purple-900/30 rounded-xl px-4 py-3 text-white focus:border-purple-500/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Nombre</label>
                    <input
                      value={cat.nombre}
                      onChange={(e) => handleChange(cat.id, "nombre", e.target.value)}      
                      className="w-full bg-black/50 border border-purple-900/30 rounded-xl px-4 py-3 text-white focus:border-purple-500/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Descripción</label>
                    <input
                      value={cat.descripcion}
                      onChange={(e) => handleChange(cat.id, "descripcion", e.target.value)} 
                      className="w-full bg-black/50 border border-purple-900/30 rounded-xl px-4 py-3 text-white focus:border-purple-500/50 transition-all"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-400 mb-1">Imagen</label>
                    <div className="flex gap-4 items-start">
                      {cat.imagen && (
                        <img 
                          src={cat.imagen} 
                          alt={cat.nombre} 
                          className="w-24 h-24 object-cover rounded-xl border border-purple-900/30" 
                        />
                      )}
                      <div className="flex-1">
                        <input
                          value={cat.imagen}
                          onChange={(e) => handleChange(cat.id, "imagen", e.target.value)}  
                          placeholder="URL de la imagen"
                          className="w-full bg-black/50 border border-purple-900/30 rounded-xl px-4 py-3 text-white mb-3 focus:border-purple-500/50 transition-all"
                        />
                        <label className="inline-flex items-center gap-2 bg-black/50 border border-purple-900/30 hover:border-purple-500/30 text-white px-4 py-2 rounded-xl cursor-pointer transition-colors">
                          <Upload size={16} />
                          {uploading === cat.id ? "Subiendo..." : "Subir imagen"}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => e.target.files?.[0] && handleImageUpload(cat.id, e.target.files[0])}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={cat.activo}
                      onChange={(e) => handleChange(cat.id, "activo", e.target.checked)}    
                      className="accent-purple-500 w-5 h-5"
                    />
                    <label className="text-sm text-white">Activo</label>
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

export default AdminCategorias;