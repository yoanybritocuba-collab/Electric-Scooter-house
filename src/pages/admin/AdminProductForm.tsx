import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Navigate, useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc, addDoc, collection } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/firebase/config";
import AdminNavBack from "@/components/AdminNavBack";
import { Upload, X, Save, Globe, RefreshCw, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
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

// Especificaciones predefinidas - SIMPLES Y CLARAS
const especificacionesPredefinidas: Record<string, Array<{ key: string; label: string; unit: string; type: string }>> = {
  patinetes: [
    { key: "autonomia", label: "Autonomía", unit: "km", type: "text" },
    { key: "velocidad_max", label: "Velocidad máxima", unit: "km/h", type: "text" },
    { key: "peso", label: "Peso", unit: "kg", type: "text" },
    { key: "potencia_motor", label: "Potencia motor", unit: "W", type: "text" },
    { key: "bateria", label: "Batería", unit: "Ah", type: "text" },
    { key: "tiempo_carga", label: "Tiempo de carga", unit: "horas", type: "text" },
    { key: "neumaticos", label: "Neumáticos", unit: "", type: "text" },
    { key: "frenos", label: "Frenos", unit: "", type: "text" },
  ],
  bicicletas: [
    { key: "autonomia", label: "Autonomía", unit: "km", type: "text" },
    { key: "velocidad_max", label: "Velocidad máxima", unit: "km/h", type: "text" },
    { key: "peso", label: "Peso", unit: "kg", type: "text" },
    { key: "motor", label: "Motor", unit: "W", type: "text" },
    { key: "bateria", label: "Batería", unit: "Ah", type: "text" },
    { key: "cambio", label: "Cambio", unit: "", type: "text" },
  ],
  motos: [
    { key: "autonomia", label: "Autonomía", unit: "km", type: "text" },
    { key: "velocidad_max", label: "Velocidad máxima", unit: "km/h", type: "text" },
    { key: "peso", label: "Peso", unit: "kg", type: "text" },
    { key: "potencia_motor", label: "Potencia motor", unit: "kW", type: "text" },
    { key: "bateria", label: "Batería", unit: "kWh", type: "text" },
    { key: "carga_maxima", label: "Carga máxima", unit: "kg", type: "text" },
    { key: "frenos", label: "Frenos", unit: "", type: "text" },
  ],
  accesorios: [
    { key: "material", label: "Material", unit: "", type: "text" },
    { key: "color", label: "Color", unit: "", type: "text" },
    { key: "compatibilidad", label: "Compatibilidad", unit: "", type: "text" },
  ],
  infantiles: [
    { key: "edad", label: "Edad recomendada", unit: "años", type: "text" },
    { key: "peso_maximo", label: "Peso máximo", unit: "kg", type: "text" },
    { key: "velocidad_max", label: "Velocidad máxima", unit: "km/h", type: "text" },
  ],
  "movilidad-reducida": [
    { key: "autonomia", label: "Autonomía", unit: "km", type: "text" },
    { key: "velocidad_max", label: "Velocidad máxima", unit: "km/h", type: "text" },
    { key: "peso", label: "Peso", unit: "kg", type: "text" },
    { key: "capacidad", label: "Capacidad máxima", unit: "kg", type: "text" },
    { key: "plegable", label: "Plegable", unit: "", type: "checkbox" },
  ],
  piezas: [
    { key: "marca", label: "Marca", unit: "", type: "text" },
    { key: "compatibilidad", label: "Compatibilidad", unit: "", type: "text" },
    { key: "material", label: "Material", unit: "", type: "text" },
  ],
  default: [
    { key: "especificacion1", label: "Especificación 1", unit: "", type: "text" },
    { key: "especificacion2", label: "Especificación 2", unit: "", type: "text" },
    { key: "especificacion3", label: "Especificación 3", unit: "", type: "text" },
  ]
};

interface EspecificacionItem {
  key: string;
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

  // Inicializar especificaciones según categoría
  const initEspecificacionesPorCategoria = (categoriaId: string) => {
    const predef = especificacionesPredefinidas[categoriaId] || especificacionesPredefinidas.default;
    
    const nuevasEspecs: EspecificacionItem[] = predef.map(esp => ({
      ...esp,
      valor: ""
    }));
    
    setEspecificacionesList(nuevasEspecs);
    setForm(prev => ({ ...prev, especificaciones: {} }));
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
            
            // Cargar especificaciones existentes
            const predef = especificacionesPredefinidas[data.categoria] || especificacionesPredefinidas.default;
            const specsExistentes: EspecificacionItem[] = predef.map(esp => {
              let valor = data.especificaciones?.[esp.key] || "";
              // Si es checkbox, convertir booleano a texto
              if (esp.type === 'checkbox' && valor === true) valor = "Sí";
              if (esp.type === 'checkbox' && valor === false) valor = "No";
              
              return {
                ...esp,
                valor: valor,
              };
            });
            
            setEspecificacionesList(specsExistentes);
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
        initEspecificacionesPorCategoria("patinetes");
        setLoading(false);
      }
    };
    
    loadProduct();
  }, [id, isNew, navigate]);

  const handleCategoriaChange = (categoriaId: string) => {
    setForm(prev => ({ ...prev, categoria: categoriaId }));
    initEspecificacionesPorCategoria(categoriaId);
  };

  const updateEspecificacion = (index: number, valor: string) => {
    const nuevas = [...especificacionesList];
    nuevas[index] = { ...nuevas[index], valor };
    setEspecificacionesList(nuevas);
    
    // Guardar en objeto de especificaciones
    const esp = nuevas[index];
    let valorGuardar: any = valor;
    
    if (esp.type === 'checkbox') {
      valorGuardar = valor === "Sí" ? true : (valor === "No" ? false : "");
    }
    
    setForm(prev => ({
      ...prev,
      especificaciones: { ...prev.especificaciones, [esp.key]: valorGuardar }
    }));
  };

  const agregarEspecificacion = () => {
    const nuevaKey = `custom_${Date.now()}`;
    setEspecificacionesList([...especificacionesList, {
      key: nuevaKey,
      label: "Nueva especificación",
      unit: "",
      type: "text",
      valor: ""
    }]);
  };

  const eliminarEspecificacion = (index: number) => {
    const espEliminada = especificacionesList[index];
    const nuevas = especificacionesList.filter((_, i) => i !== index);
    setEspecificacionesList(nuevas);
    
    const nuevasEspec = { ...form.especificaciones };
    delete nuevasEspec[espEliminada.key];
    setForm(prev => ({ ...prev, especificaciones: nuevasEspec }));
  };

  const actualizarNombreEspecificacion = (index: number, nuevoNombre: string) => {
    const nuevas = [...especificacionesList];
    nuevas[index] = { ...nuevas[index], label: nuevoNombre };
    setEspecificacionesList(nuevas);
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
      // Construir especificaciones finales
      const especificacionesFinales: Record<string, any> = {};
      especificacionesList.forEach(esp => {
        let valor = esp.valor;
        if (esp.type === 'checkbox') {
          valor = esp.valor === "Sí" ? true : (esp.valor === "No" ? false : "");
        }
        especificacionesFinales[esp.key] = valor;
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

          {/* ESPECIFICACIONES - SIMPLE Y PRÁCTICO */}
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
                <div className="space-y-3">
                  {especificacionesList.map((esp, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <input
                        type="text"
                        value={esp.label}
                        onChange={(e) => actualizarNombreEspecificacion(idx, e.target.value)}
                        className="w-1/3 bg-black/50 border border-green-900/30 rounded-lg px-3 py-2 text-white text-sm"
                        placeholder="Nombre"
                      />
                      {esp.type === 'checkbox' ? (
                        <select
                          value={esp.valor}
                          onChange={(e) => updateEspecificacion(idx, e.target.value)}
                          className="w-1/3 bg-black/50 border border-green-900/30 rounded-lg px-3 py-2 text-white text-sm"
                        >
                          <option value="">Seleccionar</option>
                          <option value="Sí">✓ Sí</option>
                          <option value="No">✗ No</option>
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={esp.valor}
                          onChange={(e) => updateEspecificacion(idx, e.target.value)}
                          className="flex-1 bg-black/50 border border-green-900/30 rounded-lg px-3 py-2 text-white text-sm"
                          placeholder={`Valor${esp.unit ? ` (${esp.unit})` : ''}`}
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => eliminarEspecificacion(idx)}
                        className="p-2 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={agregarEspecificacion}
                    className="w-full py-2 border border-dashed border-green-500/30 rounded-lg text-green-500 hover:bg-green-500/10 flex items-center justify-center gap-2 text-sm"
                  >
                    <Plus size={14} /> Agregar especificación
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
            <label className="inline-flex items-center gap-2 bg-black/50 border border-green-900/30 rounded-lg px-4 py-2 cursor-pointer">
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