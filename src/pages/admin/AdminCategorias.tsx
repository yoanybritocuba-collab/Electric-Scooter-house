import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Navigate } from "react-router-dom";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { db, storage } from "@/firebase/config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Save, Upload, X } from "lucide-react";
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
  const { t } = useLanguage();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  const categoriaIds = [
    "patinetes", "bicicletas", "motos", "accesorios", 
    "piezas", "infantiles", "movilidad-reducida"
  ];

  useEffect(() => {
    loadCategorias();
  }, []);

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
      toast({
        title: "Éxito",
        description: "Categorías guardadas correctamente",
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

  if (!user || !isAdmin) return <Navigate to="/admin" replace />;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display font-bold text-2xl tracking-tight text-foreground">
            Gestionar Categorías
          </h1>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-glow transition-colors"
          >
            <Save size={16} />
            {saving ? "Guardando..." : "Guardar Todo"}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">Cargando...</div>
        ) : (
          <div className="space-y-6">
            {categorias.map((cat) => (
              <div key={cat.id} className="bg-secondary p-6 rounded-lg border border-border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">ID (fijo)</label>
                    <input
                      value={cat.id}
                      disabled
                      className="w-full bg-background border border-border rounded px-4 py-2 text-foreground opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">Orden</label>
                    <input
                      type="number"
                      value={cat.orden}
                      onChange={(e) => handleChange(cat.id, "orden", parseInt(e.target.value))}
                      className="w-full bg-background border border-border rounded px-4 py-2 text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">Nombre</label>
                    <input
                      value={cat.nombre}
                      onChange={(e) => handleChange(cat.id, "nombre", e.target.value)}
                      className="w-full bg-background border border-border rounded px-4 py-2 text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">Descripción</label>
                    <input
                      value={cat.descripcion}
                      onChange={(e) => handleChange(cat.id, "descripcion", e.target.value)}
                      className="w-full bg-background border border-border rounded px-4 py-2 text-foreground"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-muted-foreground mb-1">Imagen</label>
                    <div className="flex gap-4 items-start">
                      {cat.imagen && (
                        <img src={cat.imagen} alt={cat.nombre} className="w-24 h-24 object-cover rounded" />
                      )}
                      <div className="flex-1">
                        <input
                          value={cat.imagen}
                          onChange={(e) => handleChange(cat.id, "imagen", e.target.value)}
                          placeholder="URL de la imagen"
                          className="w-full bg-background border border-border rounded px-4 py-2 text-foreground mb-2"
                        />
                        <label className="flex items-center gap-2 bg-background border border-border rounded px-4 py-2 cursor-pointer hover:border-primary transition-colors w-fit">
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
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={cat.activo}
                      onChange={(e) => handleChange(cat.id, "activo", e.target.checked)}
                      className="accent-primary"
                    />
                    <label className="text-sm text-foreground">Activo</label>
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