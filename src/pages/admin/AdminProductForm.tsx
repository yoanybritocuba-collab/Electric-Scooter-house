import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Navigate, useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc, addDoc, collection } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/firebase/config";
import AdminNavBack from "@/components/AdminNavBack";
import { Upload, X, Baby, Save, Globe, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { translateFullProduct } from "@/services/translationService";

// Categorías unificadas
const categories = [
  { value: "patinetes", label: "Patinetes Eléctricos", icon: "🛴" },
  { value: "bicicletas", label: "Bicicletas Eléctricas", icon: "🚲" },
  { value: "motos", label: "Motos Eléctricas", icon: "🏍️" },
  { value: "accesorios", label: "Accesorios", icon: "🧤" },
  { value: "piezas", label: "Piezas y Repuestos", icon: "🔧" },
  { value: "infantiles", label: "Línea Infantil", icon: "🧸" },
  { value: "movilidad-reducida", label: "Movilidad Reducida", icon: "♿" },
];

const AdminProductForm = () => {
  const { user, isAdmin } = useAuth();
  const { t, lang } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === "nuevo";

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
    
    especificaciones: {
      autonomia: "",
      autonomia_en: "",
      autonomia_gr: "",
      peso: "",
      peso_en: "",
      peso_gr: "",
      plegable: false,
      velocidad_max: "",
      velocidad_max_en: "",
      velocidad_max_gr: "",
      motor: "",
      motor_en: "",
      motor_gr: "",
      bateria: "",
      bateria_en: "",
      bateria_gr: "",
      tiempo_carga: "",
      tiempo_carga_en: "",
      tiempo_carga_gr: "",
      ruedas: "",
      ruedas_en: "",
      ruedas_gr: "",
      cambios: "",
      cambios_en: "",
      cambios_gr: "",
      suspension: false,
      frenos: "",
      frenos_en: "",
      frenos_gr: "",
      iluminacion: "",
      iluminacion_en: "",
      iluminacion_gr: "",
      edad_recomendada: "",
      edad_recomendada_en: "",
      edad_recomendada_gr: "",
      colores: [] as string[],
      luces: false,
      sonidos: false,
      autonomia_bateria: "",
      autonomia_bateria_en: "",
      autonomia_bateria_gr: "",
      max_peso: "",
      max_peso_en: "",
      max_peso_gr: "",
      inclinacion_max: "",
      inclinacion_max_en: "",
      inclinacion_max_gr: "",
      giro: "",
      giro_en: "",
      giro_gr: "",
    },
  });

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [colorInput, setColorInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      if (!isNew && id) {
        setLoading(true);
        try {
          const docRef = doc(db, "productos", id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setForm(docSnap.data() as any);
          } else {
            toast({
              title: "Error",
              description: "Producto no encontrado",
              variant: "destructive",
            });
            navigate("/admin/dashboard");
          }
        } catch (error) {
          console.error("Error cargando producto:", error);
          toast({
            title: "Error",
            description: "No se pudo cargar el producto",
            variant: "destructive",
          });
        }
        setLoading(false);
      }
    };
    loadProduct();
  }, [id, isNew, navigate]);

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
      toast({
        title: "Éxito",
        description: "Imágenes subidas correctamente",
        className: "bg-green-500 text-white",
      });
    } catch (error) {
      console.error("Error subiendo imágenes:", error);
      toast({
        title: "Error",
        description: "No se pudieron subir las imágenes",
        variant: "destructive",
      });
    }
    setUploading(false);
  };

  const removeImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      imagenes: prev.imagenes.filter((_, i) => i !== index),
    }));
  };

  const addColor = () => {
    if (colorInput.trim() && !form.especificaciones.colores.includes(colorInput.trim())) {
      setForm({
        ...form,
        especificaciones: {
          ...form.especificaciones,
          colores: [...form.especificaciones.colores, colorInput.trim()],
        },
      });
      setColorInput("");
    }
  };

  const removeColor = (color: string) => {
    setForm({
      ...form,
      especificaciones: {
        ...form.especificaciones,
        colores: form.especificaciones.colores.filter(c => c !== color),
      },
    });
  };

  const handleAutoTranslateFull = async () => {
    if (!form.nombre.trim()) {
      toast({
        title: "Error",
        description: "Primero escribe el nombre en español",
        variant: "destructive",
      });
      return;
    }

    setTranslating(true);
    try {
      const translations = await translateFullProduct(form);
      
      setForm(prev => ({
        ...prev,
        nombre_en: translations.nombre_en || prev.nombre_en,
        nombre_gr: translations.nombre_gr || prev.nombre_gr,
        descripcion_en: translations.descripcion_en || prev.descripcion_en,
        descripcion_gr: translations.descripcion_gr || prev.descripcion_gr,
        especificaciones: {
          ...prev.especificaciones,
          ...translations.especificaciones
        }
      }));
      
      toast({
        title: "Éxito",
        description: "✅ Producto traducido completamente a inglés y griego",
        className: "bg-green-500 text-white",
      });
    } catch (error) {
      console.error("Error en traducción:", error);
      toast({
        title: "Error",
        description: "No se pudo traducir automáticamente",
        variant: "destructive",
      });
    }
    setTranslating(false);
  };

  const handleSave = async () => {
    if (!form.nombre.trim()) {
      toast({
        title: "Error",
        description: "El nombre en español es obligatorio",
        variant: "destructive",
      });
      return;
    }
    if (form.precio <= 0) {
      toast({
        title: "Error",
        description: "El precio debe ser mayor a 0",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      let productData = { ...form };
      
      if (!form.nombre_en || !form.nombre_gr || 
          !form.descripcion_en || !form.descripcion_gr) {
        
        toast({
          title: "Traduciendo",
          description: "Generando traducciones automáticas...",
        });
        
        const translations = await translateFullProduct(form);
        
        productData = {
          ...productData,
          nombre_en: translations.nombre_en || form.nombre_en,
          nombre_gr: translations.nombre_gr || form.nombre_gr,
          descripcion_en: translations.descripcion_en || form.descripcion_en,
          descripcion_gr: translations.descripcion_gr || form.descripcion_gr,
          especificaciones: {
            ...form.especificaciones,
            ...translations.especificaciones
          }
        };
      }
      
      productData.updatedAt = new Date();
      if (isNew) {
        productData.createdAt = new Date();
      }

      if (isNew) {
        await addDoc(collection(db, "productos"), productData);
        toast({
          title: "Éxito",
          description: "Producto creado correctamente",
          className: "bg-green-500 text-white",
        });
      } else if (id) {
        await setDoc(doc(db, "productos", id), productData);
        toast({
          title: "Éxito",
          description: "Producto actualizado correctamente",
          className: "bg-green-500 text-white",
        });
      }
      navigate("/admin/dashboard");
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "No se pudo guardar el producto",
        variant: "destructive",
      });
    }
    setSaving(false);
  };

  const isInfantil = form.categoria === "infantiles";

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header con navegación */}
        <div className="mb-8">
          <AdminNavBack 
            title={isNew ? getText('Nuevo Producto', 'New Product', 'Νέο Προϊόν') : getText('Editar Producto', 'Edit Product', 'Επεξεργασία Προϊόντος')}
            description={getText('Completa la información en 3 idiomas', 'Complete information in 3 languages', 'Συμπληρώστε πληροφορίες σε 3 γλώσσες')}
          />

          <div className="mt-4 flex flex-col sm:flex-row justify-end gap-3">
            <button
              onClick={handleAutoTranslateFull}
              disabled={translating || !form.nombre.trim()}
              className="px-6 py-3 bg-black/50 text-green-500 rounded-xl hover:bg-green-500/10 transition-all flex items-center justify-center gap-2 text-sm sm:text-base border border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.1)] hover:shadow-[0_0_15px_rgba(34,197,94,0.3)]"
            >
              {translating ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Traduciendo...</span>
                </>
              ) : (
                <>
                  <Globe size={16} />
                  <span>Auto-traducir</span>
                </>
              )}
            </button>
            
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-8 py-4 bg-green-500/20 text-green-500 rounded-xl hover:bg-green-500/30 transition-all flex items-center justify-center gap-2 text-base sm:text-lg font-bold shadow-lg border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.3)]"
            >
              <Save size={20} />
              <span>{saving ? 'Guardando...' : 'Guardar Producto'}</span>
            </button>
          </div>
        </div>

        <div className="bg-[#0a0a0a] rounded-2xl border border-green-900/30 p-6 hover:border-green-500/50 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:shadow-[0_0_25px_rgba(34,197,94,0.2)]">
          <div className="space-y-6">
            {/* ===== NOMBRE EN 3 IDIOMAS ===== */}
            <div className="border-b border-green-900/30 pb-4">
              <h3 className="font-display font-bold text-lg text-white mb-4">Nombre del producto</h3>
              
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-1">
                  Español <span className="text-green-500">*</span>
                </label>
                <input
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="w-full bg-black/50 border border-green-900/30 rounded-xl px-4 py-3 text-white outline-none focus:border-green-500/50 transition-all"
                  placeholder="Nombre en español"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-1">English</label>
                <input
                  value={form.nombre_en || ""}
                  onChange={(e) => setForm({ ...form, nombre_en: e.target.value })}
                  className="w-full bg-black/50 border border-green-900/30 rounded-xl px-4 py-3 text-white outline-none focus:border-green-500/50 transition-all"
                  placeholder="Name in English"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-1">Ελληνικά</label>
                <input
                  value={form.nombre_gr || ""}
                  onChange={(e) => setForm({ ...form, nombre_gr: e.target.value })}
                  className="w-full bg-black/50 border border-green-900/30 rounded-xl px-4 py-3 text-white outline-none focus:border-green-500/50 transition-all"
                  placeholder="Όνομα στα Ελληνικά"
                />
              </div>
            </div>

            {/* Precio y descuento */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Precio (€) *</label>
                <input
                  type="number"
                  value={form.precio}
                  onChange={(e) => setForm({ ...form, precio: Number(e.target.value) })}
                  min="0"
                  step="0.01"
                  className="w-full bg-black/50 border border-green-900/30 rounded-xl px-4 py-3 text-white outline-none focus:border-green-500/50 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Descuento (%)</label>
                <input
                  type="number"
                  value={form.descuento || 0}
                  onChange={(e) => setForm({ ...form, descuento: Number(e.target.value) })}
                  min="0"
                  max="100"
                  className="w-full bg-black/50 border border-green-900/30 rounded-xl px-4 py-3 text-white outline-none focus:border-green-500/50 transition-all"
                />
              </div>
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Categoría *</label>
              <select
                value={form.categoria}
                onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                className="w-full bg-black/50 border border-green-900/30 rounded-xl px-4 py-3 text-white outline-none focus:border-green-500/50 transition-all"
              >
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.icon} {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* ===== DESCRIPCIÓN EN 3 IDIOMAS ===== */}
            <div className="border-b border-green-900/30 pb-4">
              <h3 className="font-display font-bold text-lg text-white mb-4">Descripción</h3>
              
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-1">Español</label>
                <textarea
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  rows={3}
                  className="w-full bg-black/50 border border-green-900/30 rounded-xl px-4 py-3 text-white outline-none focus:border-green-500/50 transition-all resize-none"
                  placeholder="Descripción en español"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-1">English</label>
                <textarea
                  value={form.descripcion_en || ""}
                  onChange={(e) => setForm({ ...form, descripcion_en: e.target.value })}
                  rows={3}
                  className="w-full bg-black/50 border border-green-900/30 rounded-xl px-4 py-3 text-white outline-none focus:border-green-500/50 transition-all resize-none"
                  placeholder="Description in English"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-1">Ελληνικά</label>
                <textarea
                  value={form.descripcion_gr || ""}
                  onChange={(e) => setForm({ ...form, descripcion_gr: e.target.value })}
                  rows={3}
                  className="w-full bg-black/50 border border-green-900/30 rounded-xl px-4 py-3 text-white outline-none focus:border-green-500/50 transition-all resize-none"
                  placeholder="Περιγραφή στα Ελληνικά"
                />
              </div>
            </div>

            {/* Imágenes */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Imágenes</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {form.imagenes.map((img, i) => (
                  <div key={i} className="relative w-20 h-20">
                    <img src={img} alt="" className="w-full h-full object-cover rounded-lg border border-green-900/30" />
                    <button
                      onClick={() => removeImage(i)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
              <label className="inline-flex items-center gap-2 bg-black/50 border border-green-900/30 rounded-xl px-4 py-3 cursor-pointer hover:border-green-500/50 transition-colors">
                <Upload size={16} className="text-green-500" />
                <span className="text-gray-400 text-sm">
                  {uploading ? "Subiendo..." : "Subir imágenes"}
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files)}
                  className="hidden"
                />
              </label>
            </div>

            {/* ===== ESPECIFICACIONES ===== */}
            <div className="border-b border-green-900/30 pb-4">
              <h3 className="font-display font-bold text-lg text-white mb-4">Especificaciones</h3>

              {/* Autonomía */}
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-1">Autonomía / Range / Αυτονομία</label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    value={form.especificaciones.autonomia}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        especificaciones: { ...form.especificaciones, autonomia: e.target.value },
                      })
                    }
                    placeholder="Español"
                    className="bg-black/50 border border-green-900/30 rounded-lg px-3 py-2 text-white"
                  />
                  <input
                    value={form.especificaciones.autonomia_en || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        especificaciones: { ...form.especificaciones, autonomia_en: e.target.value },
                      })
                    }
                    placeholder="English"
                    className="bg-black/50 border border-green-900/30 rounded-lg px-3 py-2 text-white"
                  />
                  <input
                    value={form.especificaciones.autonomia_gr || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        especificaciones: { ...form.especificaciones, autonomia_gr: e.target.value },
                      })
                    }
                    placeholder="Ελληνικά"
                    className="bg-black/50 border border-green-900/30 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              {/* Peso */}
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-1">Peso / Weight / Βάρος</label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    value={form.especificaciones.peso}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        especificaciones: { ...form.especificaciones, peso: e.target.value },
                      })
                    }
                    placeholder="Español"
                    className="bg-black/50 border border-green-900/30 rounded-lg px-3 py-2 text-white"
                  />
                  <input
                    value={form.especificaciones.peso_en || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        especificaciones: { ...form.especificaciones, peso_en: e.target.value },
                      })
                    }
                    placeholder="English"
                    className="bg-black/50 border border-green-900/30 rounded-lg px-3 py-2 text-white"
                  />
                  <input
                    value={form.especificaciones.peso_gr || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        especificaciones: { ...form.especificaciones, peso_gr: e.target.value },
                      })
                    }
                    placeholder="Ελληνικά"
                    className="bg-black/50 border border-green-900/30 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              {/* Velocidad máxima */}
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-1">Velocidad máx / Max speed / Μέγιστη ταχύτητα</label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    value={form.especificaciones.velocidad_max || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        especificaciones: { ...form.especificaciones, velocidad_max: e.target.value },
                      })
                    }
                    placeholder="Español"
                    className="bg-black/50 border border-green-900/30 rounded-lg px-3 py-2 text-white"
                  />
                  <input
                    value={form.especificaciones.velocidad_max_en || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        especificaciones: { ...form.especificaciones, velocidad_max_en: e.target.value },
                      })
                    }
                    placeholder="English"
                    className="bg-black/50 border border-green-900/30 rounded-lg px-3 py-2 text-white"
                  />
                  <input
                    value={form.especificaciones.velocidad_max_gr || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        especificaciones: { ...form.especificaciones, velocidad_max_gr: e.target.value },
                      })
                    }
                    placeholder="Ελληνικά"
                    className="bg-black/50 border border-green-900/30 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              {/* Motor */}
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-1">Motor / Motor / Κινητήρας</label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    value={form.especificaciones.motor || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        especificaciones: { ...form.especificaciones, motor: e.target.value },
                      })
                    }
                    placeholder="Español"
                    className="bg-black/50 border border-green-900/30 rounded-lg px-3 py-2 text-white"
                  />
                  <input
                    value={form.especificaciones.motor_en || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        especificaciones: { ...form.especificaciones, motor_en: e.target.value },
                      })
                    }
                    placeholder="English"
                    className="bg-black/50 border border-green-900/30 rounded-lg px-3 py-2 text-white"
                  />
                  <input
                    value={form.especificaciones.motor_gr || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        especificaciones: { ...form.especificaciones, motor_gr: e.target.value },
                      })
                    }
                    placeholder="Ελληνικά"
                    className="bg-black/50 border border-green-900/30 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              {/* Batería */}
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-1">Batería / Battery / Μπαταρία</label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    value={form.especificaciones.bateria || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        especificaciones: { ...form.especificaciones, bateria: e.target.value },
                      })
                    }
                    placeholder="Español"
                    className="bg-black/50 border border-green-900/30 rounded-lg px-3 py-2 text-white"
                  />
                  <input
                    value={form.especificaciones.bateria_en || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        especificaciones: { ...form.especificaciones, bateria_en: e.target.value },
                      })
                    }
                    placeholder="English"
                    className="bg-black/50 border border-green-900/30 rounded-lg px-3 py-2 text-white"
                  />
                  <input
                    value={form.especificaciones.bateria_gr || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        especificaciones: { ...form.especificaciones, bateria_gr: e.target.value },
                      })
                    }
                    placeholder="Ελληνικά"
                    className="bg-black/50 border border-green-900/30 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              {/* Edad recomendada - solo para infantiles */}
              {isInfantil && (
                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-1">Edad recomendada / Recommended age / Συνιστώμενη ηλικία</label>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      value={form.especificaciones.edad_recomendada || ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          especificaciones: { ...form.especificaciones, edad_recomendada: e.target.value },
                        })
                      }
                      placeholder="Español"
                      className="bg-black/50 border border-green-900/30 rounded-lg px-3 py-2 text-white"
                    />
                    <input
                      value={form.especificaciones.edad_recomendada_en || ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          especificaciones: { ...form.especificaciones, edad_recomendada_en: e.target.value },
                        })
                      }
                      placeholder="English"
                      className="bg-black/50 border border-green-900/30 rounded-lg px-3 py-2 text-white"
                    />
                    <input
                      value={form.especificaciones.edad_recomendada_gr || ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          especificaciones: { ...form.especificaciones, edad_recomendada_gr: e.target.value },
                        })
                      }
                      placeholder="Ελληνικά"
                      className="bg-black/50 border border-green-900/30 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                </div>
              )}

              {/* Colores */}
              {isInfantil && (
                <div className="mt-4">
                  <label className="block text-sm text-gray-400 mb-1">Colores disponibles</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {form.especificaciones.colores?.map((color) => (
                      <span
                        key={color}
                        className="inline-flex items-center gap-1 bg-black/50 border border-green-900/30 px-3 py-1 rounded-full text-sm text-white"
                      >
                        {color}
                        <button
                          onClick={() => removeColor(color)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={colorInput}
                      onChange={(e) => setColorInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addColor()}
                      placeholder="Añadir color"
                      className="flex-1 bg-black/50 border border-green-900/30 rounded-lg px-4 py-2 text-white outline-none focus:border-green-500/50 transition-all"
                    />
                    <button
                      onClick={addColor}
                      className="px-4 py-2 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500/30 transition-all border border-green-500/30"
                    >
                      Añadir
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Checkboxes */}
            <div className="flex flex-wrap gap-6">
              {[
                { key: "masVendido", label: "Más vendido" },
                { key: "nuevo", label: "Nuevo" },
                { key: "rebaja", label: "Rebaja" },
                { key: "especificaciones.plegable", label: "Plegable" },
              ].map(({ key, label }) => {
                const isSpec = key.startsWith("especificaciones.");
                const specKey = key.split(".")[1];
                const checked = isSpec
                  ? (form.especificaciones as any)[specKey]
                  : (form as any)[key];
                return (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checked || false}
                      onChange={(e) => {
                        if (isSpec) {
                          setForm({
                            ...form,
                            especificaciones: {
                              ...form.especificaciones,
                              [specKey]: e.target.checked,
                            },
                          });
                        } else {
                          setForm({ ...form, [key]: e.target.checked });
                        }
                      }}
                      className="accent-green-500"
                    />
                    <span className="text-gray-300 text-sm">{label}</span>
                  </label>
                );
              })}
            </div>

            {/* Botón cancelar */}
            <div className="flex justify-end pt-4">
              <button
                onClick={() => navigate("/admin/dashboard")}
                className="px-6 py-3 bg-black/50 text-gray-400 rounded-xl hover:bg-black/70 transition-all border border-green-900/30"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProductForm;