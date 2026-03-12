import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Navigate, useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc, addDoc, collection } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/firebase/config";
import { Upload, X, Baby } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Categorías unificadas (incluye infantiles y movilidad reducida)
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
    precio: 0,
    categoria: "patinetes",
    descripcion: "",
    imagenes: [] as string[],
    masVendido: false,
    nuevo: false,
    rebaja: false,
    descuento: 0,
    especificaciones: {
      autonomia: "",
      peso: "",
      plegable: false,
      // Campos específicos por categoría
      velocidad_max: "",
      motor: "",
      bateria: "",
      tiempo_carga: "",
      ruedas: "",
      cambios: "",
      suspension: false,
      frenos: "",
      iluminacion: "",
      // Campos infantiles
      edad_recomendada: "",
      colores: [] as string[],
      luces: false,
      sonidos: false,
      // Campos movilidad reducida
      autonomia_bateria: "",
      max_peso: "",
      inclinacion_max: "",
      giro: "",
    },
  });

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
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

  const handleSave = async () => {
    // Validaciones
    if (!form.nombre.trim()) {
      toast({
        title: "Error",
        description: "El nombre es obligatorio",
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
      const productData = {
        ...form,
        updatedAt: new Date(),
        createdAt: isNew ? new Date() : form.createdAt,
      };

      if (isNew) {
        await addDoc(collection(db, "productos"), productData);
        toast({
          title: "Éxito",
          description: "Producto creado correctamente",
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
  const isMovilidad = form.categoria === "movilidad-reducida";

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 lg:px-8">
        <h1 className="font-display font-bold text-2xl tracking-tight text-foreground mb-8">
          {isNew ? "Añadir Producto" : "Editar Producto"}
        </h1>

        <div className="space-y-6">
          {/* Nombre */}
          <div>
            <label className="block text-sm text-muted-foreground mb-1">Nombre *</label>
            <input
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="w-full bg-secondary border border-border rounded px-4 py-3 text-foreground outline-none focus:border-primary transition-colors"
              required
            />
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

          {/* Descripción */}
          <div>
            <label className="block text-sm text-muted-foreground mb-1">Descripción</label>
            <textarea
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              rows={4}
              className="w-full bg-secondary border border-border rounded px-4 py-3 text-foreground outline-none focus:border-primary transition-colors resize-none"
            />
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

          {/* Especificaciones generales */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Autonomía</label>
              <input
                value={form.especificaciones.autonomia}
                onChange={(e) =>
                  setForm({
                    ...form,
                    especificaciones: { ...form.especificaciones, autonomia: e.target.value },
                  })
                }
                placeholder="Ej: 25 km"
                className="w-full bg-secondary border border-border rounded px-4 py-3 text-foreground outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Peso</label>
              <input
                value={form.especificaciones.peso}
                onChange={(e) =>
                  setForm({
                    ...form,
                    especificaciones: { ...form.especificaciones, peso: e.target.value },
                  })
                }
                placeholder="Ej: 15 kg"
                className="w-full bg-secondary border border-border rounded px-4 py-3 text-foreground outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* Campos específicos para infantiles */}
          {isInfantil && (
            <div className="border-t border-border pt-4 mt-4">
              <div className="flex items-center gap-2 mb-4">
                <Baby size={20} className="text-primary" />
                <h3 className="font-display font-bold text-foreground">Especificaciones Infantiles</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Edad recomendada</label>
                  <input
                    value={form.especificaciones.edad_recomendada || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        especificaciones: { ...form.especificaciones, edad_recomendada: e.target.value },
                      })
                    }
                    placeholder="Ej: 3-5 años"
                    className="w-full bg-secondary border border-border rounded px-4 py-3 text-foreground outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Velocidad máxima</label>
                  <input
                    value={form.especificaciones.velocidad_max || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        especificaciones: { ...form.especificaciones, velocidad_max: e.target.value },
                      })
                    }
                    placeholder="Ej: 5 km/h"
                    className="w-full bg-secondary border border-border rounded px-4 py-3 text-foreground outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Batería</label>
                  <input
                    value={form.especificaciones.bateria || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        especificaciones: { ...form.especificaciones, bateria: e.target.value },
                      })
                    }
                    placeholder="Ej: 12V 4.5Ah"
                    className="w-full bg-secondary border border-border rounded px-4 py-3 text-foreground outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Tiempo de carga</label>
                  <input
                    value={form.especificaciones.tiempo_carga || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        especificaciones: { ...form.especificaciones, tiempo_carga: e.target.value },
                      })
                    }
                    placeholder="Ej: 4-6 horas"
                    className="w-full bg-secondary border border-border rounded px-4 py-3 text-foreground outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {/* Colores */}
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

              <div className="flex gap-6 mt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.especificaciones.luces || false}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        especificaciones: { ...form.especificaciones, luces: e.target.checked },
                      })
                    }
                    className="accent-primary"
                  />
                  <span className="text-foreground text-sm">Luces</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.especificaciones.sonidos || false}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        especificaciones: { ...form.especificaciones, sonidos: e.target.checked },
                      })
                    }
                    className="accent-primary"
                  />
                  <span className="text-foreground text-sm">Sonidos</span>
                </label>
              </div>
            </div>
          )}

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