import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Navigate, useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc, addDoc, collection } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/firebase/config";
import { Upload, X, Baby } from "lucide-react";
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
  const { t } = useLanguage();
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
  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;

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
      
      // Traducción automática al guardar si faltan campos
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
          description: "Producto creado correctamente con todas las traducciones",
        });
      } else if (id) {
        await setDoc(doc(db, "productos", id), productData);
        toast({
          title: "Éxito",
          description: "Producto actualizado correctamente",
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
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 lg:px-8">
        <h1 className="font-display font-bold text-2xl tracking-tight text-foreground mb-8">
          {isNew ? "Añadir Producto" : "Editar Producto"}
        </h1>

        <div className="space-y-6">
          {/* ===== NOMBRE EN 3 IDIOMAS ===== */}
          <div className="border-b border-border pb-4">
            <h3 className="font-display font-bold text-lg text-foreground mb-4">Nombre del producto</h3>
            
            <div className="mb-4">
              <label className="block text-sm text-muted-foreground mb-1">
                Español <span className="text-primary">*</span>
              </label>
              <input
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="w-full bg-secondary border border-border rounded px-4 py-3 text-foreground outline-none focus:border-primary transition-colors"
                placeholder="Nombre en español"
                required
              />
            </div>

            {/* Botón de traducción COMPLETA */}
            <div className="mb-6">
              <button
                type="button"
                onClick={handleAutoTranslateFull}
                disabled={translating || !form.nombre.trim()}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-[#E83C8C] to-[#C084FC] text-white font-bold rounded-lg hover:opacity-90 transition-all duration-300 disabled:opacity-50"
              >
                {translating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Traduciendo todo el producto...</span>
                  </>
                ) : (
                  <>
                    <span>🌐</span>
                    <span>TRADUCIR PRODUCTO COMPLETO (Nombre + Descripción + Especificaciones)</span>
                  </>
                )}
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-muted-foreground mb-1">English</label>
              <input
                value={form.nombre_en || ""}
                onChange={(e) => setForm({ ...form, nombre_en: e.target.value })}
                className="w-full bg-secondary border border-border rounded px-4 py-3 text-foreground outline-none focus:border-primary transition-colors"
                placeholder="Name in English"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm text-muted-foreground mb-1">Ελληνικά</label>
              <input
                value={form.nombre_gr || ""}
                onChange={(e) => setForm({ ...form, nombre_gr: e.target.value })}
                className="w-full bg-secondary border border-border rounded px-4 py-3 text-foreground outline-none focus:border-primary transition-colors"
                placeholder="Όνομα στα Ελληνικά"
              />
            </div>
          </div>

          {/* Precio */}
          <div>
            <label className="block text-sm text-muted-foreground mb-1">Precio (€) *</label>
            <input
              type="number"
              value={form.precio}
              onChange={(e) => setForm({ ...form, precio: Number(e.target.value) })}
              min="0"
              step="0.01"
              className="w-full bg-secondary border border-border rounded px-4 py-3 text-foreground outline-none focus:border-primary transition-colors"
              required
            />
          </div>

          {/* Descuento */}
          <div>
            <label className="block text-sm text-muted-foreground mb-1">Descuento (%)</label>
            <input
              type="number"
              value={form.descuento || 0}
              onChange={(e) => setForm({ ...form, descuento: Number(e.target.value) })}
              min="0"
              max="100"
              className="w-full bg-secondary border border-border rounded px-4 py-3 text-foreground outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm text-muted-foreground mb-1">Categoría *</label>
            <select
              value={form.categoria}
              onChange={(e) => setForm({ ...form, categoria: e.target.value })}
              className="w-full bg-secondary border border-border rounded px-4 py-3 text-foreground outline-none focus:border-primary transition-colors"
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.icon} {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* ===== DESCRIPCIÓN EN 3 IDIOMAS ===== */}
          <div className="border-b border-border pb-4">
            <h3 className="font-display font-bold text-lg text-foreground mb-4">Descripción</h3>
            
            <div className="mb-4">
              <label className="block text-sm text-muted-foreground mb-1">Español</label>
              <textarea
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                rows={3}
                className="w-full bg-secondary border border-border rounded px-4 py-3 text-foreground outline-none focus:border-primary transition-colors resize-none"
                placeholder="Descripción en español"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm text-muted-foreground mb-1">English</label>
              <textarea
                value={form.descripcion_en || ""}
                onChange={(e) => setForm({ ...form, descripcion_en: e.target.value })}
                rows={3}
                className="w-full bg-secondary border border-border rounded px-4 py-3 text-foreground outline-none focus:border-primary transition-colors resize-none"
                placeholder="Description in English"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm text-muted-foreground mb-1">Ελληνικά</label>
              <textarea
                value={form.descripcion_gr || ""}
                onChange={(e) => setForm({ ...form, descripcion_gr: e.target.value })}
                rows={3}
                className="w-full bg-secondary border border-border rounded px-4 py-3 text-foreground outline-none focus:border-primary transition-colors resize-none"
                placeholder="Περιγραφή στα Ελληνικά"
              />
            </div>
          </div>

          {/* Imágenes */}
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Imágenes</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {form.imagenes.map((img, i) => (
                <div key={i} className="relative w-20 h-20">
                  <img src={img} alt="" className="w-full h-full object-cover rounded" />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
            <label className="flex items-center gap-2 bg-secondary border border-border rounded px-4 py-3 cursor-pointer hover:border-primary transition-colors w-fit">
              <Upload size={16} className="text-muted-foreground" />
              <span className="text-muted-foreground text-sm">
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

          {/* ===== ESPECIFICACIONES EN 3 IDIOMAS ===== */}
          <div className="border-b border-border pb-4">
            <h3 className="font-display font-bold text-lg text-foreground mb-4">Especificaciones</h3>

            {/* Autonomía */}
            <div className="mb-4">
              <label className="block text-sm text-muted-foreground mb-1">Autonomía / Range / Αυτονομία</label>
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
                  className="bg-secondary border border-border rounded px-3 py-2 text-foreground"
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
                  className="bg-secondary border border-border rounded px-3 py-2 text-foreground"
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
                  className="bg-secondary border border-border rounded px-3 py-2 text-foreground"
                />
              </div>
            </div>

            {/* Peso */}
            <div className="mb-4">
              <label className="block text-sm text-muted-foreground mb-1">Peso / Weight / Βάρος</label>
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
                  className="bg-secondary border border-border rounded px-3 py-2 text-foreground"
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
                  className="bg-secondary border border-border rounded px-3 py-2 text-foreground"
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
                  className="bg-secondary border border-border rounded px-3 py-2 text-foreground"
                />
              </div>
            </div>

            {/* Velocidad máxima */}
            <div className="mb-4">
              <label className="block text-sm text-muted-foreground mb-1">Velocidad máx / Max speed / Μέγιστη ταχύτητα</label>
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
                  className="bg-secondary border border-border rounded px-3 py-2 text-foreground"
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
                  className="bg-secondary border border-border rounded px-3 py-2 text-foreground"
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
                  className="bg-secondary border border-border rounded px-3 py-2 text-foreground"
                />
              </div>
            </div>

            {/* Motor */}
            <div className="mb-4">
              <label className="block text-sm text-muted-foreground mb-1">Motor / Motor / Κινητήρας</label>
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
                  className="bg-secondary border border-border rounded px-3 py-2 text-foreground"
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
                  className="bg-secondary border border-border rounded px-3 py-2 text-foreground"
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
                  className="bg-secondary border border-border rounded px-3 py-2 text-foreground"
                />
              </div>
            </div>

            {/* Batería */}
            <div className="mb-4">
              <label className="block text-sm text-muted-foreground mb-1">Batería / Battery / Μπαταρία</label>
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
                  className="bg-secondary border border-border rounded px-3 py-2 text-foreground"
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
                  className="bg-secondary border border-border rounded px-3 py-2 text-foreground"
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
                  className="bg-secondary border border-border rounded px-3 py-2 text-foreground"
                />
              </div>
            </div>

            {/* Tiempo de carga */}
            <div className="mb-4">
              <label className="block text-sm text-muted-foreground mb-1">Tiempo carga / Charging time / Χρόνος φόρτισης</label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  value={form.especificaciones.tiempo_carga || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      especificaciones: { ...form.especificaciones, tiempo_carga: e.target.value },
                    })
                  }
                  placeholder="Español"
                  className="bg-secondary border border-border rounded px-3 py-2 text-foreground"
                />
                <input
                  value={form.especificaciones.tiempo_carga_en || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      especificaciones: { ...form.especificaciones, tiempo_carga_en: e.target.value },
                    })
                  }
                  placeholder="English"
                  className="bg-secondary border border-border rounded px-3 py-2 text-foreground"
                />
                <input
                  value={form.especificaciones.tiempo_carga_gr || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      especificaciones: { ...form.especificaciones, tiempo_carga_gr: e.target.value },
                    })
                  }
                  placeholder="Ελληνικά"
                  className="bg-secondary border border-border rounded px-3 py-2 text-foreground"
                />
              </div>
            </div>

            {/* Edad recomendada - solo para infantiles */}
            {isInfantil && (
              <div className="mb-4">
                <label className="block text-sm text-muted-foreground mb-1">Edad recomendada / Recommended age / Συνιστώμενη ηλικία</label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    value={form.especificaciones.edad_recomendada || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        especificaciones: { ...form.especificaciones, edad_recomendada: e.target.value },
                      })
                    }
                    placeholder="Ej: 3-5 años"
                    className="bg-secondary border border-border rounded px-3 py-2 text-foreground"
                  />
                  <input
                    value={form.especificaciones.edad_recomendada_en || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        especificaciones: { ...form.especificaciones, edad_recomendada_en: e.target.value },
                      })
                    }
                    placeholder="E.g: 3-5 years"
                    className="bg-secondary border border-border rounded px-3 py-2 text-foreground"
                  />
                  <input
                    value={form.especificaciones.edad_recomendada_gr || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        especificaciones: { ...form.especificaciones, edad_recomendada_gr: e.target.value },
                      })
                    }
                    placeholder="Π.χ: 3-5 χρόνια"
                    className="bg-secondary border border-border rounded px-3 py-2 text-foreground"
                  />
                </div>
              </div>
            )}

            {/* Colores */}
            {isInfantil && (
              <div className="mt-4">
                <label className="block text-sm text-muted-foreground mb-1">Colores disponibles</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {form.especificaciones.colores?.map((color) => (
                    <span
                      key={color}
                      className="inline-flex items-center gap-1 bg-secondary px-3 py-1 rounded-full text-sm"
                    >
                      {color}
                      <button
                        onClick={() => removeColor(color)}
                        className="text-muted-foreground hover:text-destructive"
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
                    className="flex-1 bg-secondary border border-border rounded px-4 py-2 text-foreground outline-none focus:border-primary transition-colors"
                  />
                  <button
                    onClick={addColor}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-glow transition-colors"
                  >
                    Añadir
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Checkboxes generales */}
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
                    className="accent-primary"
                  />
                  <span className="text-foreground text-sm">{label}</span>
                </label>
              );
            })}
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-primary text-primary-foreground font-display font-bold tracking-widest text-sm py-3 rounded transition-all duration-300 hover:bg-glow disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Guardar Producto"}
            </button>
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="px-6 bg-secondary text-foreground font-display text-sm tracking-widest py-3 rounded transition-colors hover:bg-muted"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProductForm;