import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Navigate, useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc, addDoc, collection } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/firebase/config";
import AdminNavBack from "@/components/AdminNavBack";
import { Upload, X, Save, Globe, RefreshCw, Plus, Trash2, ChevronDown, ChevronUp, Edit2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { translateToAll } from "@/services/translationService";

const categories = [
  { value: "patinetes", label: "Patinetes Eléctricos", icon: "🛴" },
  { value: "bicicletas", label: "Bicicletas Eléctricas", icon: "🚲" },
  { value: "motos", label: "Motos Eléctricas", icon: "🏍️" },
  { value: "accesorios", label: "Accesorios", icon: "🧤" },
  { value: "piezas", label: "Piezas y Repuestos", icon: "🔧" },
  { value: "infantiles", label: "Línea Infantil", icon: "🧸" },
  { value: "movilidad-reducida", label: "Movilidad Reducida", icon: "♿" },
];

// Especificaciones sugeridas por categoría (solo como sugerencia, el admin puede modificarlas)
const especificacionesSugeridas: Record<string, Array<{ key: string; label: string; unit: string; type: string }>> = {
  patinetes: [
    { key: "autonomia", label: "Autonomía", unit: "km", type: "text" },
    { key: "velocidad_max", label: "Velocidad máxima", unit: "km/h", type: "text" },
    { key: "peso", label: "Peso", unit: "kg", type: "text" },
    { key: "potencia_motor", label: "Potencia motor", unit: "W", type: "text" },
  ],
  bicicletas: [
    { key: "autonomia", label: "Autonomía", unit: "km", type: "text" },
    { key: "velocidad_max", label: "Velocidad máxima", unit: "km/h", type: "text" },
    { key: "peso", label: "Peso", unit: "kg", type: "text" },
    { key: "motor", label: "Motor", unit: "W", type: "text" },
  ],
  motos: [
    { key: "autonomia", label: "Autonomía", unit: "km", type: "text" },
    { key: "velocidad_max", label: "Velocidad máxima", unit: "km/h", type: "text" },
    { key: "peso", label: "Peso", unit: "kg", type: "text" },
    { key: "potencia_motor", label: "Potencia motor", unit: "kW", type: "text" },
  ],
  default: [
    { key: "especificacion1", label: "Especificación 1", unit: "", type: "text" },
    { key: "especificacion2", label: "Especificación 2", unit: "", type: "text" },
  ]
};

interface EspecificacionItem {
  id: string;
  label: string;
  unit: string;
  type: string;
  valor: string;
}

const AdminProductForm = () => {
  const { user, isAdmin } = useAuth();
  const { lang } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === "nuevo" || !id;

  const [form, setForm] = useState({
    nombre: "",
    nombre_en: "",
    nombre_gr: "",
    descripcion: "",
    descripcion_en: "",
    descripcion_gr: "",
    precio: 0,
    categoria: "patinetes",
    imagenes: [] as string[],
    masVendido: false,
    nuevo: false,
    rebaja: false,
    descuento: 0,
    especificaciones: {} as Record<string, any>,
  });

  const [especificacionesList, setEspecificacionesList] = useState<EspecificacionItem[]>([]);
  const [mostrarEspecificaciones, setMostrarEspecificaciones] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [loading, setLoading] = useState(false);

  // Inicializar especificaciones desde Firebase o crear nuevas
  const initEspecificaciones = (categoriaId: string, especificacionesGuardadas?: Record<string, any>) => {
    let nuevasEspecs: EspecificacionItem[] = [];
    
    if (especificacionesGuardadas && Object.keys(especificacionesGuardadas).length > 0) {
      // Cargar especificaciones guardadas
      nuevasEspecs = Object.entries(especificacionesGuardadas)
        .filter(([key]) => !key.endsWith('_en') && !key.endsWith('_gr'))
        .map(([key, value]) => ({
          id: key,
          label: key,
          unit: "",
          type: "text",
          valor: value as string,
        }));
    } else {
      // Usar especificaciones sugeridas por categoría
      const sugeridas = especificacionesSugeridas[categoriaId] || especificacionesSugeridas.default;
      nuevasEspecs = sugeridas.map((esp, idx) => ({
        id: esp.key,
        label: esp.label,
        unit: esp.unit,
        type: esp.type,
        valor: "",
      }));
    }
    
    setEspecificacionesList(nuevasEspecs);
    
    // Construir objeto de especificaciones para guardar
    const especObj: Record<string, any> = {};
    nuevasEspecs.forEach(esp => {
      especObj[esp.id] = esp.valor;
    });
    setForm(prev => ({ ...prev, especificaciones: especObj }));
  };

  useEffect(() => {
    const loadProduct = async () => {
      if (!isNew && id) {
        setLoading(true);
        try {
          const docRef = doc(db, "productos", id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            
            setForm({
              nombre: data.nombre || "",
              nombre_en: data.nombre_en || "",
              nombre_gr: data.nombre_gr || "",
              descripcion: data.descripcion || "",
              descripcion_en: data.descripcion_en || "",
              descripcion_gr: data.descripcion_gr || "",
              precio: data.precio || 0,
              categoria: data.categoria || "patinetes",
              imagenes: data.imagenes || [],
              masVendido: data.masVendido === true,
              nuevo: data.nuevo === true,
              rebaja: data.rebaja === true,
              descuento: data.descuento || 0,
              especificaciones: data.especificaciones || {},
            });
            
            // Cargar especificaciones guardadas
            initEspecificaciones(data.categoria, data.especificaciones);
          } else {
            toast({ title: "Error", description: "Producto no encontrado", variant: "destructive" });
            navigate("/admin/dashboard");
          }
        } catch (error) {
          console.error("Error cargando producto:", error);
          toast({ title: "Error", description: "No se pudo cargar el producto", variant: "destructive" });
        }
        setLoading(false);
      } else {
        initEspecificaciones("patinetes", {});
        setLoading(false);
      }
    };
    
    loadProduct();
  }, [id, isNew, navigate]);

  const handleCategoriaChange = (categoriaId: string) => {
    setForm(prev => ({ ...prev, categoria: categoriaId }));
    initEspecificaciones(categoriaId, {});
  };

  const updateEspecificacionValor = (id: string, valor: string) => {
    const nuevas = especificacionesList.map(esp =>
      esp.id === id ? { ...esp, valor } : esp
    );
    setEspecificacionesList(nuevas);
    
    // Actualizar objeto de especificaciones
    const especObj: Record<string, any> = {};
    nuevas.forEach(esp => {
      especObj[esp.id] = esp.valor;
    });
    setForm(prev => ({ ...prev, especificaciones: especObj }));
  };

  const updateEspecificacionLabel = (id: string, nuevoLabel: string) => {
    const nuevas = especificacionesList.map(esp =>
      esp.id === id ? { ...esp, label: nuevoLabel } : esp
    );
    setEspecificacionesList(nuevas);
    
    // Actualizar objeto de especificaciones (cambiar la clave)
    const especObj: Record<string, any> = {};
    nuevas.forEach(esp => {
      especObj[esp.label] = esp.valor;
    });
    setForm(prev => ({ ...prev, especificaciones: especObj }));
  };

  const agregarEspecificacion = () => {
    const newId = `espec_${Date.now()}`;
    setEspecificacionesList([...especificacionesList, {
      id: newId,
      label: "Nueva especificación",
      unit: "",
      type: "text",
      valor: ""
    }]);
  };

  const eliminarEspecificacion = (id: string) => {
    const nuevas = especificacionesList.filter(esp => esp.id !== id);
    setEspecificacionesList(nuevas);
    
    // Actualizar objeto de especificaciones
    const especObj: Record<string, any> = {};
    nuevas.forEach(esp => {
      especObj[esp.label] = esp.valor;
    });
    setForm(prev => ({ ...prev, especificaciones: especObj }));
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files) return;
    setUploading(true);
    const urls: string[] = [];
    try {
      for (const file of Array.from(files)) {
        const storageRef = ref(storage, `productos/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        urls.push(url);
      }
      setForm((prev) => ({ ...prev, imagenes: [...prev.imagenes, ...urls] }));
      toast({ title: "Éxito", description: "Imágenes subidas", className: "bg-green-500 text-white" });
    } catch (error) {
      toast({ title: "Error", description: "No se pudieron subir las imágenes", variant: "destructive" });
    }
    setUploading(false);
  };

  const removeImage = (index: number) => {
    setForm((prev) => ({ ...prev, imagenes: prev.imagenes.filter((_, i) => i !== index) }));
  };

  const handleAutoTranslate = async () => {
    if (!form.nombre.trim()) {
      toast({ title: "Error", description: "Escribe el nombre en español primero", variant: "destructive" });
      return;
    }

    setTranslating(true);
    try {
      const nombreTrans = await translateToAll(form.nombre, 'es');
      const descTrans = await translateToAll(form.descripcion || form.nombre, 'es');
      
      setForm(prev => ({
        ...prev,
        nombre_en: nombreTrans.en,
        nombre_gr: nombreTrans.gr,
        descripcion_en: descTrans.en,
        descripcion_gr: descTrans.gr,
      }));
      
      toast({ title: "Éxito", description: "Traducido a inglés y griego", className: "bg-green-500 text-white" });
    } catch (error) {
      toast({ title: "Error", description: "No se pudo traducir", variant: "destructive" });
    }
    setTranslating(false);
  };

  const handleSave = async () => {
    if (!form.nombre.trim()) {
      toast({ title: "Error", description: "El nombre es obligatorio", variant: "destructive" });
      return;
    }
    if (form.precio <= 0) {
      toast({ title: "Error", description: "El precio debe ser mayor a 0", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      // Construir especificaciones finales con los labels como claves
      const especificacionesFinales: Record<string, any> = {};
      especificacionesList.forEach(esp => {
        if (esp.label && esp.label.trim()) {
          especificacionesFinales[esp.label] = esp.valor;
        }
      });
      
      const productData = {
        nombre: form.nombre,
        nombre_en: form.nombre_en || "",
        nombre_gr: form.nombre_gr || "",
        descripcion: form.descripcion,
        descripcion_en: form.descripcion_en || "",
        descripcion_gr: form.descripcion_gr || "",
        precio: form.precio,
        categoria: form.categoria,
        imagenes: form.imagenes,
        masVendido: form.masVendido === true,
        nuevo: form.nuevo === true,
        rebaja: form.rebaja === true,
        descuento: form.descuento || 0,
        especificaciones: especificacionesFinales,
        updatedAt: new Date(),
      };
      
      if (isNew) {
        await addDoc(collection(db, "productos"), productData);
        toast({ title: "Éxito", description: "Producto creado", className: "bg-green-500 text-white" });
      } else if (id) {
        await setDoc(doc(db, "productos", id), productData);
        toast({ title: "Éxito", description: "Producto actualizado", className: "bg-green-500 text-white" });
      }
      
      setTimeout(() => navigate("/admin/dashboard"), 1000);
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "No se pudo guardar", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (!user || !isAdmin) return <Navigate to="/admin" replace />;

  const getText = (es: string, en: string, gr: string) => {
    if (lang === 'en') return en;
    if (lang === 'gr') return gr;
    return es;
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <AdminNavBack 
            title={isNew ? "Nuevo Producto" : "Editar Producto"}
            description="Completa la información del producto"
          />

          <div className="mt-4 flex justify-end gap-3">
            <button
              onClick={handleAutoTranslate}
              disabled={translating || !form.nombre}
              className="px-4 py-2 bg-black/50 text-green-500 rounded-xl hover:bg-green-500/10 flex items-center gap-2 border border-green-500/30"
            >
              <Globe size={16} />
              {translating ? "Traduciendo..." : "Auto-traducir"}
            </button>
            
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-green-500/20 text-green-500 rounded-xl hover:bg-green-500/30 flex items-center gap-2 font-bold border border-green-500/30"
            >
              <Save size={18} />
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>

        <div className="bg-[#0a0a0a] rounded-2xl border border-green-900/30 p-6">
          {/* NOMBRE */}
          <div className="mb-6">
            <label className="block text-sm text-gray-400 mb-1">Nombre del producto *</label>
            <input
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="w-full bg-black/50 border border-green-900/30 rounded-xl px-4 py-3 text-white"
              placeholder="Ej: Moto eléctrica futurista"
            />
            <div className="grid grid-cols-2 gap-3 mt-2">
              <input
                value={form.nombre_en}
                onChange={(e) => setForm({ ...form, nombre_en: e.target.value })}
                className="bg-black/50 border border-green-900/30 rounded-xl px-4 py-2 text-white text-sm"
                placeholder="English name"
              />
              <input
                value={form.nombre_gr}
                onChange={(e) => setForm({ ...form, nombre_gr: e.target.value })}
                className="bg-black/50 border border-green-900/30 rounded-xl px-4 py-2 text-white text-sm"
                placeholder="Ελληνικό όνομα"
              />
            </div>
          </div>

          {/* PRECIO Y CATEGORÍA */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Precio (€) *</label>
              <input
                type="number"
                value={form.precio}
                onChange={(e) => setForm({ ...form, precio: Number(e.target.value) })}
                className="w-full bg-black/50 border border-green-900/30 rounded-xl px-4 py-3 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Categoría</label>
              <select
                value={form.categoria}
                onChange={(e) => handleCategoriaChange(e.target.value)}
                className="w-full bg-black/50 border border-green-900/30 rounded-xl px-4 py-3 text-white"
              >
                {categories.map(c => (
                  <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* DESCRIPCIÓN */}
          <div className="mb-6">
            <label className="block text-sm text-gray-400 mb-1">Descripción</label>
            <textarea
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              rows={3}
              className="w-full bg-black/50 border border-green-900/30 rounded-xl px-4 py-3 text-white"
              placeholder="Descripción en español..."
            />
            <div className="grid grid-cols-2 gap-3 mt-2">
              <textarea
                value={form.descripcion_en}
                onChange={(e) => setForm({ ...form, descripcion_en: e.target.value })}
                rows={2}
                className="bg-black/50 border border-green-900/30 rounded-xl px-4 py-2 text-white text-sm"
                placeholder="English description"
              />
              <textarea
                value={form.descripcion_gr}
                onChange={(e) => setForm({ ...form, descripcion_gr: e.target.value })}
                rows={2}
                className="bg-black/50 border border-green-900/30 rounded-xl px-4 py-2 text-white text-sm"
                placeholder="Ελληνική περιγραφή"
              />
            </div>
          </div>

          {/* ESPECIFICACIONES - COMPLETAMENTE EDITABLE */}
          <div className="border border-green-900/30 rounded-xl overflow-hidden mb-6">
            <button
              type="button"
              onClick={() => setMostrarEspecificaciones(!mostrarEspecificaciones)}
              className="w-full flex items-center justify-between p-3 bg-black/30 hover:bg-green-500/5"
            >
              <span className="font-medium text-white">📋 Especificaciones técnicas</span>
              {mostrarEspecificaciones ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            
            {mostrarEspecificaciones && (
              <div className="p-4 pt-0 border-t border-green-900/30">
                <p className="text-xs text-gray-500 mb-3">
                  ✏️ Puedes editar el nombre, el valor, agregar o eliminar especificaciones
                </p>
                <div className="space-y-3">
                  {especificacionesList.map((esp) => (
                    <div key={esp.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-3 bg-black/30 rounded-lg border border-green-900/20">
                      <div className="flex-1 w-full sm:w-auto">
                        <input
                          type="text"
                          value={esp.label}
                          onChange={(e) => updateEspecificacionLabel(esp.id, e.target.value)}
                          className="w-full bg-black/50 border border-green-900/30 rounded-lg px-3 py-2 text-white text-sm"
                          placeholder="Nombre de la especificación"
                        />
                      </div>
                      <div className="flex-1 w-full sm:w-auto">
                        <input
                          type="text"
                          value={esp.valor}
                          onChange={(e) => updateEspecificacionValor(esp.id, e.target.value)}
                          className="w-full bg-black/50 border border-green-900/30 rounded-lg px-3 py-2 text-white text-sm"
                          placeholder="Valor (ej: 80 km/h, Sí, 5 kg)"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => eliminarEspecificacion(esp.id)}
                        className="p-2 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Eliminar especificación"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={agregarEspecificacion}
                    className="w-full py-2 border border-dashed border-green-500/30 rounded-lg text-green-500 hover:bg-green-500/10 flex items-center justify-center gap-2 text-sm transition-all"
                  >
                    <Plus size={14} /> Agregar nueva especificación
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* IMÁGENES */}
          <div className="mb-6">
            <label className="block text-sm text-gray-400 mb-2">Imágenes</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {form.imagenes.map((img, i) => (
                <div key={i} className="relative w-16 h-16">
                  <img src={img} className="w-full h-full object-cover rounded-lg border border-green-900/30" />
                  <button onClick={() => removeImage(i)} className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 flex items-center justify-center text-xs">
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
            <label className="inline-flex items-center gap-2 bg-black/50 border border-green-900/30 rounded-lg px-4 py-2 cursor-pointer hover:border-green-500/50 transition-colors">
              <Upload size={14} />
              {uploading ? "Subiendo..." : "Subir imágenes"}
              <input type="file" multiple accept="image/*" onChange={(e) => handleImageUpload(e.target.files)} className="hidden" />
            </label>
          </div>

          {/* OPCIONES */}
          <div className="flex flex-wrap gap-4 pt-2 border-t border-green-900/30">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.masVendido} onChange={(e) => setForm({ ...form, masVendido: e.target.checked })} className="accent-green-500" />
              <span>⭐ Más vendido</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.nuevo} onChange={(e) => setForm({ ...form, nuevo: e.target.checked })} className="accent-green-500" />
              <span>✨ Nuevo</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.rebaja} onChange={(e) => setForm({ ...form, rebaja: e.target.checked })} className="accent-green-500" />
              <span>🔥 En oferta</span>
            </label>
            {form.rebaja && (
              <input
                type="number"
                placeholder="% descuento"
                value={form.descuento}
                onChange={(e) => setForm({ ...form, descuento: Number(e.target.value) })}
                className="w-24 bg-black/50 border border-green-900/30 rounded-lg px-2 py-1 text-white text-sm"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProductForm;