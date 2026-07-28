import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Navigate, useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc, addDoc, collection } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/firebase/config";
import AdminNavBack from "@/components/AdminNavBack";
import { 
  Upload, X, Save, RefreshCw, Plus, Trash2, 
  ChevronDown, ChevronUp, Palette, Battery, Gauge, 
  Star, Sparkles, Percent, Package, FileText, Zap, AlertCircle
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { translateToAll } from "@/services/translationService";

const categories = [
  { value: "patinetes", label: "🛴 Patinetes Eléctricos" },
  { value: "bicicletas", label: "🚲 Bicicletas Eléctricas" },
  { value: "motos", label: "🏍️ Motos Eléctricas" },
  { value: "accesorios", label: "🧤 Accesorios" },
  { value: "piezas", label: "🔧 Piezas y Repuestos" },
  { value: "infantiles", label: "🧸 Línea Infantil" },
  { value: "movilidad-reducida", label: "♿ Movilidad Reducida" },
];

interface OpcionItem {
  id: string;
  nombre: string;
  nombre_en?: string;
  nombre_gr?: string;
  precioExtra: number;
  stock: number;
  codigoColor?: string;
  imagenes?: string[];
}

interface OpcionesProducto {
  voltajes: OpcionItem[];
  potencias: OpcionItem[];
  colores: OpcionItem[];
  amperios: OpcionItem[];
}

interface CombinacionStock {
  voltajeId: string;
  potenciaId: string;
  amperioId: string;
  colorId: string;
  stock: number;
}

const AdminProductForm = () => {
  const { user, isAdmin } = useAuth();
  const { lang } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === "nuevo" || !id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

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
    opciones: {
      voltajes: [] as OpcionItem[],
      potencias: [] as OpcionItem[],
      colores: [] as OpcionItem[],
      amperios: [] as OpcionItem[],
    } as OpcionesProducto,
    stockCombinaciones: [] as CombinacionStock[],
  });

  // Estados para nuevas opciones
  const [nuevoVoltaje, setNuevoVoltaje] = useState<OpcionItem>({
    id: "",
    nombre: "",
    nombre_en: "",
    nombre_gr: "",
    precioExtra: 0,
    stock: 0,
  });
  const [nuevaPotencia, setNuevaPotencia] = useState<OpcionItem>({
    id: "",
    nombre: "",
    nombre_en: "",
    nombre_gr: "",
    precioExtra: 0,
    stock: 0,
  });
  const [nuevoColor, setNuevoColor] = useState<OpcionItem>({
    id: "",
    nombre: "",
    nombre_en: "",
    nombre_gr: "",
    precioExtra: 0,
    stock: 0,
    codigoColor: "#2ecc71",
    imagenes: [],
  });
  const [nuevoAmperio, setNuevoAmperio] = useState<OpcionItem>({
    id: "",
    nombre: "",
    nombre_en: "",
    nombre_gr: "",
    precioExtra: 0,
    stock: 0,
  });

  const [mostrarVoltajes, setMostrarVoltajes] = useState(true);
  const [mostrarPotencias, setMostrarPotencias] = useState(true);
  const [mostrarColores, setMostrarColores] = useState(true);
  const [mostrarAmperios, setMostrarAmperios] = useState(true);
  const [mostrarStockCombinaciones, setMostrarStockCombinaciones] = useState(true);
  const [uploadingColor, setUploadingColor] = useState<string | null>(null);

  const getText = (es: string, en: string, gr: string) => {
    if (lang === 'en') return en;
    if (lang === 'gr') return gr;
    return es;
  };

  // ========== CARGAR PRODUCTO PARA EDITAR ==========
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
              opciones: data.opciones || { voltajes: [], potencias: [], colores: [], amperios: [] },
              stockCombinaciones: data.stockCombinaciones || [],
            });
          }
        } catch (error) {
          console.error("Error cargando producto:", error);
          toast({ title: "Error", description: "No se pudo cargar el producto", variant: "destructive" });
        }
        setLoading(false);
      }
    };
    loadProduct();
  }, [id, isNew]);

  // ========== FUNCIONES: VOLTAJES ==========
  const agregarVoltaje = () => {
    if (!nuevoVoltaje.nombre.trim()) {
      toast({ title: "Error", description: "Ingresa el nombre del voltaje", variant: "destructive" });
      return;
    }
    const newId = `v_${Date.now()}`;
    setForm(prev => ({
      ...prev,
      opciones: {
        ...prev.opciones,
        voltajes: [...prev.opciones.voltajes, { ...nuevoVoltaje, id: newId }]
      }
    }));
    setNuevoVoltaje({ id: "", nombre: "", nombre_en: "", nombre_gr: "", precioExtra: 0, stock: 0 });
    toast({ title: "✅ Voltaje agregado", className: "bg-green-500 text-white" });
  };

  const eliminarVoltaje = (id: string) => {
    setForm(prev => ({
      ...prev,
      opciones: {
        ...prev.opciones,
        voltajes: prev.opciones.voltajes.filter(v => v.id !== id)
      }
    }));
  };

  const updateVoltaje = (id: string, field: keyof OpcionItem, value: any) => {
    setForm(prev => ({
      ...prev,
      opciones: {
        ...prev.opciones,
        voltajes: prev.opciones.voltajes.map(v => v.id === id ? { ...v, [field]: value } : v)
      }
    }));
  };

  // ========== FUNCIONES: POTENCIAS ==========
  const agregarPotencia = () => {
    if (!nuevaPotencia.nombre.trim()) {
      toast({ title: "Error", description: "Ingresa el nombre de la potencia", variant: "destructive" });
      return;
    }
    const newId = `p_${Date.now()}`;
    setForm(prev => ({
      ...prev,
      opciones: {
        ...prev.opciones,
        potencias: [...prev.opciones.potencias, { ...nuevaPotencia, id: newId }]
      }
    }));
    setNuevaPotencia({ id: "", nombre: "", nombre_en: "", nombre_gr: "", precioExtra: 0, stock: 0 });
    toast({ title: "✅ Potencia agregada", className: "bg-green-500 text-white" });
  };

  const eliminarPotencia = (id: string) => {
    setForm(prev => ({
      ...prev,
      opciones: {
        ...prev.opciones,
        potencias: prev.opciones.potencias.filter(p => p.id !== id)
      }
    }));
  };

  const updatePotencia = (id: string, field: keyof OpcionItem, value: any) => {
    setForm(prev => ({
      ...prev,
      opciones: {
        ...prev.opciones,
        potencias: prev.opciones.potencias.map(p => p.id === id ? { ...p, [field]: value } : p)
      }
    }));
  };

  // ========== FUNCIONES: COLORES ==========
  const agregarColor = () => {
    if (!nuevoColor.nombre.trim()) {
      toast({ title: "Error", description: "Ingresa el nombre del color", variant: "destructive" });
      return;
    }
    const newId = `c_${Date.now()}`;
    setForm(prev => ({
      ...prev,
      opciones: {
        ...prev.opciones,
        colores: [...prev.opciones.colores, { ...nuevoColor, id: newId }]
      }
    }));
    setNuevoColor({ id: "", nombre: "", nombre_en: "", nombre_gr: "", precioExtra: 0, stock: 0, codigoColor: "#2ecc71", imagenes: [] });
    toast({ title: "✅ Color agregado", className: "bg-green-500 text-white" });
  };

  const eliminarColor = (id: string) => {
    setForm(prev => ({
      ...prev,
      opciones: {
        ...prev.opciones,
        colores: prev.opciones.colores.filter(c => c.id !== id)
      }
    }));
  };

  const updateColor = (id: string, field: keyof OpcionItem, value: any) => {
    setForm(prev => ({
      ...prev,
      opciones: {
        ...prev.opciones,
        colores: prev.opciones.colores.map(c => c.id === id ? { ...c, [field]: value } : c)
      }
    }));
  };

  const addColorImage = async (colorId: string, file: File) => {
    setUploadingColor(colorId);
    try {
      const storageRef = ref(storage, `productos/colores/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setForm(prev => ({
        ...prev,
        opciones: {
          ...prev.opciones,
          colores: prev.opciones.colores.map(c => 
            c.id === colorId ? { ...c, imagenes: [...(c.imagenes || []), url] } : c
          )
        }
      }));
      toast({ title: "✅ Imagen subida", className: "bg-green-500 text-white" });
    } catch (error) {
      toast({ title: "Error", description: "No se pudo subir la imagen", variant: "destructive" });
    }
    setUploadingColor(null);
  };

  const removeColorImage = (colorId: string, index: number) => {
    setForm(prev => ({
      ...prev,
      opciones: {
        ...prev.opciones,
        colores: prev.opciones.colores.map(c => 
          c.id === colorId ? { ...c, imagenes: (c.imagenes || []).filter((_, i) => i !== index) } : c
        )
      }
    }));
  };

  // ========== FUNCIONES: AMPERIOS ==========
  const agregarAmperio = () => {
    if (!nuevoAmperio.nombre.trim()) {
      toast({ title: "Error", description: "Ingresa el nombre del amperio", variant: "destructive" });
      return;
    }
    const newId = `a_${Date.now()}`;
    setForm(prev => ({
      ...prev,
      opciones: {
        ...prev.opciones,
        amperios: [...prev.opciones.amperios, { ...nuevoAmperio, id: newId }]
      }
    }));
    setNuevoAmperio({ id: "", nombre: "", nombre_en: "", nombre_gr: "", precioExtra: 0, stock: 0 });
    toast({ title: "✅ Amperio agregado", className: "bg-green-500 text-white" });
  };

  const eliminarAmperio = (id: string) => {
    setForm(prev => ({
      ...prev,
      opciones: {
        ...prev.opciones,
        amperios: prev.opciones.amperios.filter(a => a.id !== id)
      }
    }));
  };

  const updateAmperio = (id: string, field: keyof OpcionItem, value: any) => {
    setForm(prev => ({
      ...prev,
      opciones: {
        ...prev.opciones,
        amperios: prev.opciones.amperios.map(a => a.id === id ? { ...a, [field]: value } : a)
      }
    }));
  };

  // ========== FUNCIONES PARA STOCK POR COMBINACIÓN ==========
  const actualizarStockCombinacion = (voltajeId: string, potenciaId: string, amperioId: string, colorId: string, stock: number) => {
    setForm(prev => {
      const existente = prev.stockCombinaciones.find(
        c => c.voltajeId === voltajeId && 
             c.potenciaId === potenciaId && 
             c.amperioId === amperioId && 
             c.colorId === colorId
      );
      
      if (existente) {
        return {
          ...prev,
          stockCombinaciones: prev.stockCombinaciones.map(c =>
            c.voltajeId === voltajeId && 
            c.potenciaId === potenciaId && 
            c.amperioId === amperioId && 
            c.colorId === colorId
              ? { ...c, stock }
              : c
          )
        };
      } else {
        return {
          ...prev,
          stockCombinaciones: [
            ...prev.stockCombinaciones,
            { voltajeId, potenciaId, amperioId, colorId, stock }
          ]
        };
      }
    });
  };

  const obtenerStockCombinacion = (voltajeId: string, potenciaId: string, amperioId: string, colorId: string): number => {
    const encontrado = form.stockCombinaciones.find(
      c => c.voltajeId === voltajeId && 
           c.potenciaId === potenciaId && 
           c.amperioId === amperioId && 
           c.colorId === colorId
    );
    return encontrado ? encontrado.stock : 0;
  };

  const getNombreById = (id: string, lista: OpcionItem[]): string => {
    const item = lista.find(i => i.id === id);
    return item ? item.nombre : '?';
  };

  // ========== FUNCIONES: IMÁGENES GENERALES ==========
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
      setForm(prev => ({ ...prev, imagenes: [...prev.imagenes, ...urls] }));
      toast({ title: "✅ Imágenes subidas", description: `${urls.length} imágenes`, className: "bg-green-500 text-white" });
    } catch (error) {
      toast({ title: "Error", description: "No se pudieron subir las imágenes", variant: "destructive" });
    }
    setUploading(false);
  };

  const removeImage = (index: number) => {
    setForm(prev => ({ ...prev, imagenes: prev.imagenes.filter((_, i) => i !== index) }));
  };

  // ========== FUNCIÓN PARA TRADUCIR ESPECIFICACIONES ==========
  const traducirEspecificaciones = async (especificaciones: Record<string, any>) => {
    const nuevasEspecificaciones: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(especificaciones)) {
      if (key.endsWith('_en') || key.endsWith('_gr') || key.endsWith('_en_value') || key.endsWith('_gr_value')) {
        nuevasEspecificaciones[key] = value;
        continue;
      }
      
      try {
        const transKey = await translateToAll(key, 'es');
        const transValue = await translateToAll(value, 'es');
        
        nuevasEspecificaciones[key] = value;
        nuevasEspecificaciones[`${key}_en`] = transKey.en || key;
        nuevasEspecificaciones[`${key}_gr`] = transKey.gr || key;
        nuevasEspecificaciones[`${key}_en_value`] = transValue.en || value;
        nuevasEspecificaciones[`${key}_gr_value`] = transValue.gr || value;
        
      } catch (error) {
        console.error(`Error traduciendo ${key}:`, error);
        nuevasEspecificaciones[key] = value;
      }
    }
    
    return nuevasEspecificaciones;
  };

  // ========== 🔥 NUEVA FUNCIÓN PARA TRADUCIR DESCRIPCIÓN ==========
  const traducirDescripcion = async (descripcion: string) => {
    if (!descripcion) return { en: '', gr: '' };
    
    try {
      const trans = await translateToAll(descripcion, 'es');
      return {
        en: trans.en || descripcion,
        gr: trans.gr || descripcion,
      };
    } catch (error) {
      console.error('Error traduciendo descripción:', error);
      return { en: descripcion, gr: descripcion };
    }
  };

  // ========== GUARDAR PRODUCTO (CORREGIDO CON TRADUCCIÓN DE DESCRIPCIÓN) ==========
  const handleSave = async () => {
    setSaving(true);
    try {
      // 🔥 TRADUCIR ESPECIFICACIONES
      const especificacionesTraducidas = await traducirEspecificaciones(form.especificaciones);
      
      // 🔥 TRADUCIR DESCRIPCIÓN
      const descripcionTraducida = await traducirDescripcion(form.descripcion);
      
      // 🔥 TRADUCIR VOLTAJES, POTENCIAS, COLORES, AMPERIOS
      const voltajesTraducidos = await Promise.all(
        form.opciones.voltajes.map(async (v) => {
          if (v.nombre && !v.nombre_en) {
            const trans = await translateToAll(v.nombre, 'es');
            return { ...v, nombre_en: trans.en, nombre_gr: trans.gr };
          }
          return v;
        })
      );
      
      const potenciasTraducidas = await Promise.all(
        form.opciones.potencias.map(async (p) => {
          if (p.nombre && !p.nombre_en) {
            const trans = await translateToAll(p.nombre, 'es');
            return { ...p, nombre_en: trans.en, nombre_gr: trans.gr };
          }
          return p;
        })
      );
      
      const coloresTraducidos = await Promise.all(
        form.opciones.colores.map(async (c) => {
          if (c.nombre && !c.nombre_en) {
            const trans = await translateToAll(c.nombre, 'es');
            return { ...c, nombre_en: trans.en, nombre_gr: trans.gr };
          }
          return c;
        })
      );
      
      const amperiosTraducidos = await Promise.all(
        form.opciones.amperios.map(async (a) => {
          if (a.nombre && !a.nombre_en) {
            const trans = await translateToAll(a.nombre, 'es');
            return { ...a, nombre_en: trans.en, nombre_gr: trans.gr };
          }
          return a;
        })
      );
      
      // 📦 CONSTRUIR DATOS DEL PRODUCTO CON TRADUCCIONES
      const productData = {
        nombre: form.nombre,
        nombre_en: form.nombre_en || "",
        nombre_gr: form.nombre_gr || "",
        
        // 🔥 DESCRIPCIÓN TRADUCIDA AUTOMÁTICAMENTE
        descripcion: form.descripcion,
        descripcion_en: descripcionTraducida.en || form.descripcion_en || "",
        descripcion_gr: descripcionTraducida.gr || form.descripcion_gr || "",
        
        precio: form.precio,
        categoria: form.categoria,
        imagenes: form.imagenes,
        masVendido: form.masVendido === true,
        nuevo: form.nuevo === true,
        rebaja: form.rebaja === true,
        descuento: form.descuento || 0,
        
        // 🔥 ESPECIFICACIONES TRADUCIDAS
        especificaciones: especificacionesTraducidas,
        
        // 🔥 OPCIONES TRADUCIDAS
        opciones: {
          voltajes: voltajesTraducidos,
          potencias: potenciasTraducidas,
          colores: coloresTraducidos,
          amperios: amperiosTraducidos,
        },
        
        stockCombinaciones: form.stockCombinaciones,
        updatedAt: new Date(),
      };
      
      if (isNew) {
        await addDoc(collection(db, "productos"), productData);
        toast({ title: "🎉 ¡Producto creado!", className: "bg-green-500 text-white" });
      } else if (id) {
        await setDoc(doc(db, "productos", id), productData);
        toast({ title: "🎉 ¡Producto actualizado!", className: "bg-green-500 text-white" });
      }
      setTimeout(() => navigate("/admin/dashboard"), 1500);
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "No se pudo guardar el producto", variant: "destructive" });
    }
    setSaving(false);
  };

  if (!user || !isAdmin) return <Navigate to="/admin" replace />;

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // ========== GENERAR COMBINACIONES ==========
  const generarCombinaciones = () => {
    const combinaciones = [];
    const { voltajes, potencias, amperios, colores } = form.opciones;
    
    for (const v of voltajes) {
      for (const p of potencias) {
        for (const a of amperios) {
          for (const c of colores) {
            const stock = obtenerStockCombinacion(v.id, p.id, a.id, c.id);
            combinaciones.push({
              voltaje: v.nombre,
              potencia: p.nombre,
              amperio: a.nombre,
              color: c.nombre,
              colorCodigo: c.codigoColor || '#2ecc71',
              voltajeId: v.id,
              potenciaId: p.id,
              amperioId: a.id,
              colorId: c.id,
              stock
            });
          }
        }
      }
    }
    return combinaciones;
  };

  const combinaciones = generarCombinaciones();

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* ========== HEADER ========== */}
        <AdminNavBack 
          title={isNew ? "➕ Crear Nuevo Producto" : "✏️ Editar Producto"}
          description={isNew ? "Completa todos los campos para crear un nuevo producto" : "Modifica los datos del producto existente"}
        />

        {/* ========== BOTÓN GUARDAR ========== */}
        <div className="mt-4 flex flex-wrap justify-end gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-6 py-2 rounded-xl flex items-center gap-2 font-bold transition-all ${
              saving ? 'bg-gray-600 text-gray-300 cursor-not-allowed' : 'bg-green-500/20 text-green-500 hover:bg-green-500/30 border border-green-500/30'
            }`}
          >
            {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={18} />}
            {saving ? "Guardando..." : "💾 Guardar"}
          </button>
        </div>

        <div className="bg-[#0a0a0a] rounded-2xl border border-green-900/30 p-6 mt-4 space-y-6">
          
          {/* ============================================================
          SECCIÓN 1: DATOS BÁSICOS
          ============================================================ */}
          <div className="border-b border-green-900/20 pb-4">
            <h3 className="text-green-400 text-sm font-semibold flex items-center gap-2 mb-3">
              <Package size={16} />
              📋 1. DATOS BÁSICOS DEL PRODUCTO
            </h3>
            <p className="text-gray-500 text-xs mb-2">⚠️ El nombre NO se traduce automáticamente.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nombre del producto *</label>
                <input
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="w-full bg-black/50 border border-green-900/30 rounded-xl px-4 py-3 text-white"
                  placeholder="Ej: Scooter Eléctrico Pro"
                />
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-0.5">Nombre en inglés</label>
                    <input
                      value={form.nombre_en}
                      onChange={(e) => setForm({ ...form, nombre_en: e.target.value })}
                      className="w-full bg-black/50 border border-green-900/30 rounded-xl px-4 py-2 text-white text-sm"
                      placeholder="English name"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-0.5">Nombre en griego</label>
                    <input
                      value={form.nombre_gr}
                      onChange={(e) => setForm({ ...form, nombre_gr: e.target.value })}
                      className="w-full bg-black/50 border border-green-900/30 rounded-xl px-4 py-2 text-white text-sm"
                      placeholder="Ελληνικό όνομα"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Categoría *</label>
                <select
                  value={form.categoria}
                  onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                  className="w-full bg-black/50 border border-green-900/30 rounded-xl px-4 py-3 text-white"
                >
                  {categories.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-0.5">Precio base (€)</label>
                    <input
                      type="number"
                      value={form.precio === 0 ? '' : form.precio}
                      onChange={(e) => setForm({ ...form, precio: e.target.value === '' ? 0 : Number(e.target.value) })}
                      className="w-full bg-black/50 border border-green-900/30 rounded-xl px-4 py-2 text-white text-sm"
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-0.5">Descuento (%)</label>
                    <input
                      type="number"
                      value={form.descuento === 0 ? '' : form.descuento}
                      onChange={(e) => setForm({ ...form, descuento: e.target.value === '' ? 0 : Number(e.target.value) })}
                      className="w-full bg-black/50 border border-green-900/30 rounded-xl px-4 py-2 text-white text-sm"
                      placeholder="0"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-sm text-gray-400 mb-1">Descripción del producto</label>
              <textarea
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                rows={2}
                className="w-full bg-black/50 border border-green-900/30 rounded-xl px-4 py-3 text-white"
                placeholder="Describe tu producto en español..."
              />
              <div className="grid grid-cols-2 gap-2 mt-2">
                <textarea
                  value={form.descripcion_en}
                  onChange={(e) => setForm({ ...form, descripcion_en: e.target.value })}
                  rows={1}
                  className="bg-black/50 border border-green-900/30 rounded-xl px-4 py-2 text-white text-sm"
                  placeholder="English description"
                />
                <textarea
                  value={form.descripcion_gr}
                  onChange={(e) => setForm({ ...form, descripcion_gr: e.target.value })}
                  rows={1}
                  className="bg-black/50 border border-green-900/30 rounded-xl px-4 py-2 text-white text-sm"
                  placeholder="Ελληνική περιγραφή"
                />
              </div>
            </div>
          </div>

          {/* ============================================================
          SECCIÓN 2: VOLTAJES
          ============================================================ */}
          <div className="border-b border-green-900/20 pb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-purple-400 text-sm font-semibold flex items-center gap-2">
                <Battery size={16} />
                ⚡ 2. VOLTAJES / BATERÍAS
                <span className="text-xs bg-purple-500/20 text-purple-500 px-2 py-0.5 rounded-full">
                  {form.opciones.voltajes.length}
                </span>
              </h3>
              <button
                onClick={() => setMostrarVoltajes(!mostrarVoltajes)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                {mostrarVoltajes ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            </div>
            <p className="text-gray-500 text-xs mb-2">
              Añade las opciones de voltaje. Se traducirán automáticamente al guardar.
            </p>
            
            {mostrarVoltajes && (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  <input
                    value={nuevoVoltaje.nombre}
                    onChange={(e) => setNuevoVoltaje({...nuevoVoltaje, nombre: e.target.value})}
                    placeholder="Ej: 36V, 48V, 60V"
                    className="flex-1 min-w-[100px] bg-black/50 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500/50 outline-none"
                  />
                  <input
                    type="number"
                    value={nuevoVoltaje.precioExtra === 0 ? '' : nuevoVoltaje.precioExtra}
                    onChange={(e) => setNuevoVoltaje({...nuevoVoltaje, precioExtra: e.target.value === '' ? 0 : Number(e.target.value)})}
                    placeholder="Extra €"
                    className="w-24 bg-black/50 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500/50 outline-none"
                    min="0"
                  />
                  <input
                    type="number"
                    value={nuevoVoltaje.stock === 0 ? '' : nuevoVoltaje.stock}
                    onChange={(e) => setNuevoVoltaje({...nuevoVoltaje, stock: e.target.value === '' ? 0 : Number(e.target.value)})}
                    placeholder="Stock"
                    className="w-24 bg-black/50 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500/50 outline-none"
                    min="0"
                  />
                  <button
                    onClick={agregarVoltaje}
                    className="px-4 py-2 bg-purple-500/20 text-purple-500 rounded-lg hover:bg-purple-500/30 flex items-center gap-2 text-sm transition-all"
                  >
                    <Plus size={16} /> Añadir
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {form.opciones.voltajes.map((v) => (
                    <div key={v.id} className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-lg px-3 py-2">
                      <span className="text-purple-400 text-xs font-medium">⚡</span>
                      <input
                        value={v.nombre}
                        onChange={(e) => updateVoltaje(v.id, 'nombre', e.target.value)}
                        className="bg-transparent text-white text-sm w-20 focus:outline-none"
                      />
                      <span className="text-purple-400 text-xs">+</span>
                      <input
                        type="number"
                        value={v.precioExtra === 0 ? '' : v.precioExtra}
                        onChange={(e) => updateVoltaje(v.id, 'precioExtra', e.target.value === '' ? 0 : Number(e.target.value))}
                        className="bg-transparent text-purple-400 text-sm w-12 focus:outline-none"
                        min="0"
                      />
                      <span className="text-gray-500 text-xs">€</span>
                      <input
                        type="number"
                        value={v.stock === 0 ? '' : v.stock}
                        onChange={(e) => updateVoltaje(v.id, 'stock', e.target.value === '' ? 0 : Number(e.target.value))}
                        className="bg-transparent text-gray-400 text-sm w-14 focus:outline-none"
                        placeholder="Stock"
                        min="0"
                      />
                      <button onClick={() => eliminarVoltaje(v.id)} className="text-red-500 hover:text-red-400 ml-1">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ============================================================
          SECCIÓN 2.5: AMPERIOS
          ============================================================ */}
          <div className="border-b border-green-900/20 pb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-yellow-400 text-sm font-semibold flex items-center gap-2">
                <Zap size={16} />
                🔌 2.5. AMPERIOS / INTENSIDAD
                <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full">
                  {form.opciones.amperios.length}
                </span>
              </h3>
              <button
                onClick={() => setMostrarAmperios(!mostrarAmperios)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                {mostrarAmperios ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            </div>
            <p className="text-gray-500 text-xs mb-2">
              Añade las opciones de amperaje (Ah). Se traducirán automáticamente al guardar.
            </p>
            
            {mostrarAmperios && (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  <input
                    value={nuevoAmperio.nombre}
                    onChange={(e) => setNuevoAmperio({...nuevoAmperio, nombre: e.target.value})}
                    placeholder="Ej: 20Ah, 30Ah, 40Ah"
                    className="flex-1 min-w-[100px] bg-black/50 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-yellow-500/50 outline-none"
                  />
                  <input
                    type="number"
                    value={nuevoAmperio.precioExtra === 0 ? '' : nuevoAmperio.precioExtra}
                    onChange={(e) => setNuevoAmperio({...nuevoAmperio, precioExtra: e.target.value === '' ? 0 : Number(e.target.value)})}
                    placeholder="Extra €"
                    className="w-24 bg-black/50 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-yellow-500/50 outline-none"
                    min="0"
                  />
                  <input
                    type="number"
                    value={nuevoAmperio.stock === 0 ? '' : nuevoAmperio.stock}
                    onChange={(e) => setNuevoAmperio({...nuevoAmperio, stock: e.target.value === '' ? 0 : Number(e.target.value)})}
                    placeholder="Stock"
                    className="w-24 bg-black/50 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-yellow-500/50 outline-none"
                    min="0"
                  />
                  <button
                    onClick={agregarAmperio}
                    className="px-4 py-2 bg-yellow-500/20 text-yellow-500 rounded-lg hover:bg-yellow-500/30 flex items-center gap-2 text-sm transition-all"
                  >
                    <Plus size={16} /> Añadir
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {form.opciones.amperios.map((a) => (
                    <div key={a.id} className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-3 py-2">
                      <span className="text-yellow-400 text-xs font-medium">🔌</span>
                      <input
                        value={a.nombre}
                        onChange={(e) => updateAmperio(a.id, 'nombre', e.target.value)}
                        className="bg-transparent text-white text-sm w-20 focus:outline-none"
                      />
                      <span className="text-yellow-400 text-xs">+</span>
                      <input
                        type="number"
                        value={a.precioExtra === 0 ? '' : a.precioExtra}
                        onChange={(e) => updateAmperio(a.id, 'precioExtra', e.target.value === '' ? 0 : Number(e.target.value))}
                        className="bg-transparent text-yellow-400 text-sm w-12 focus:outline-none"
                        min="0"
                      />
                      <span className="text-gray-500 text-xs">€</span>
                      <input
                        type="number"
                        value={a.stock === 0 ? '' : a.stock}
                        onChange={(e) => updateAmperio(a.id, 'stock', e.target.value === '' ? 0 : Number(e.target.value))}
                        className="bg-transparent text-gray-400 text-sm w-14 focus:outline-none"
                        placeholder="Stock"
                        min="0"
                      />
                      <button onClick={() => eliminarAmperio(a.id)} className="text-red-500 hover:text-red-400 ml-1">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ============================================================
          SECCIÓN 3: POTENCIAS
          ============================================================ */}
          <div className="border-b border-green-900/20 pb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-orange-400 text-sm font-semibold flex items-center gap-2">
                <Gauge size={16} />
                🔋 3. POTENCIAS / MOTOR
                <span className="text-xs bg-orange-500/20 text-orange-500 px-2 py-0.5 rounded-full">
                  {form.opciones.potencias.length}
                </span>
              </h3>
              <button
                onClick={() => setMostrarPotencias(!mostrarPotencias)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                {mostrarPotencias ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            </div>
            <p className="text-gray-500 text-xs mb-2">
              Añade las opciones de potencia. Se traducirán automáticamente al guardar.
            </p>
            
            {mostrarPotencias && (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  <input
                    value={nuevaPotencia.nombre}
                    onChange={(e) => setNuevaPotencia({...nuevaPotencia, nombre: e.target.value})}
                    placeholder="Ej: 500W, 1000W, 1500W"
                    className="flex-1 min-w-[100px] bg-black/50 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-orange-500/50 outline-none"
                  />
                  <input
                    type="number"
                    value={nuevaPotencia.precioExtra === 0 ? '' : nuevaPotencia.precioExtra}
                    onChange={(e) => setNuevaPotencia({...nuevaPotencia, precioExtra: e.target.value === '' ? 0 : Number(e.target.value)})}
                    placeholder="Extra €"
                    className="w-24 bg-black/50 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-orange-500/50 outline-none"
                    min="0"
                  />
                  <input
                    type="number"
                    value={nuevaPotencia.stock === 0 ? '' : nuevaPotencia.stock}
                    onChange={(e) => setNuevaPotencia({...nuevaPotencia, stock: e.target.value === '' ? 0 : Number(e.target.value)})}
                    placeholder="Stock"
                    className="w-24 bg-black/50 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-orange-500/50 outline-none"
                    min="0"
                  />
                  <button
                    onClick={agregarPotencia}
                    className="px-4 py-2 bg-orange-500/20 text-orange-500 rounded-lg hover:bg-orange-500/30 flex items-center gap-2 text-sm transition-all"
                  >
                    <Plus size={16} /> Añadir
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {form.opciones.potencias.map((p) => (
                    <div key={p.id} className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 rounded-lg px-3 py-2">
                      <span className="text-orange-400 text-xs font-medium">🔋</span>
                      <input
                        value={p.nombre}
                        onChange={(e) => updatePotencia(p.id, 'nombre', e.target.value)}
                        className="bg-transparent text-white text-sm w-20 focus:outline-none"
                      />
                      <span className="text-orange-400 text-xs">+</span>
                      <input
                        type="number"
                        value={p.precioExtra === 0 ? '' : p.precioExtra}
                        onChange={(e) => updatePotencia(p.id, 'precioExtra', e.target.value === '' ? 0 : Number(e.target.value))}
                        className="bg-transparent text-orange-400 text-sm w-12 focus:outline-none"
                        min="0"
                      />
                      <span className="text-gray-500 text-xs">€</span>
                      <input
                        type="number"
                        value={p.stock === 0 ? '' : p.stock}
                        onChange={(e) => updatePotencia(p.id, 'stock', e.target.value === '' ? 0 : Number(e.target.value))}
                        className="bg-transparent text-gray-400 text-sm w-14 focus:outline-none"
                        placeholder="Stock"
                        min="0"
                      />
                      <button onClick={() => eliminarPotencia(p.id)} className="text-red-500 hover:text-red-400 ml-1">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ============================================================
          SECCIÓN 4: COLORES
          ============================================================ */}
          <div className="border-b border-green-900/20 pb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-green-400 text-sm font-semibold flex items-center gap-2">
                <Palette size={16} />
                🎨 4. COLORES
                <span className="text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full">
                  {form.opciones.colores.length}
                </span>
              </h3>
              <button
                onClick={() => setMostrarColores(!mostrarColores)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                {mostrarColores ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            </div>
            <p className="text-gray-500 text-xs mb-2">
              Cada color puede tener su propio precio extra, stock y FOTOS específicas.
            </p>
            
            {mostrarColores && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
                  <input
                    value={nuevoColor.nombre}
                    onChange={(e) => setNuevoColor({...nuevoColor, nombre: e.target.value})}
                    placeholder="Ej: Rojo"
                    className="bg-black/50 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-green-500/50 outline-none"
                  />
                  <input
                    value={nuevoColor.nombre_en}
                    onChange={(e) => setNuevoColor({...nuevoColor, nombre_en: e.target.value})}
                    placeholder="English"
                    className="bg-black/50 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-green-500/50 outline-none"
                  />
                  <input
                    value={nuevoColor.nombre_gr}
                    onChange={(e) => setNuevoColor({...nuevoColor, nombre_gr: e.target.value})}
                    placeholder="Ελληνικά"
                    className="bg-black/50 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-green-500/50 outline-none"
                  />
                  <input
                    type="number"
                    value={nuevoColor.precioExtra === 0 ? '' : nuevoColor.precioExtra}
                    onChange={(e) => setNuevoColor({...nuevoColor, precioExtra: e.target.value === '' ? 0 : Number(e.target.value)})}
                    placeholder="Extra €"
                    className="bg-black/50 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-green-500/50 outline-none"
                    min="0"
                  />
                  <input
                    type="number"
                    value={nuevoColor.stock === 0 ? '' : nuevoColor.stock}
                    onChange={(e) => setNuevoColor({...nuevoColor, stock: e.target.value === '' ? 0 : Number(e.target.value)})}
                    placeholder="Stock"
                    className="bg-black/50 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-green-500/50 outline-none"
                    min="0"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={nuevoColor.codigoColor || '#2ecc71'}
                      onChange={(e) => setNuevoColor({...nuevoColor, codigoColor: e.target.value})}
                      className="w-10 h-10 rounded-lg cursor-pointer bg-black/50 border border-green-900/30"
                    />
                    <button
                      onClick={agregarColor}
                      className="flex-1 px-3 py-2 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500/30 flex items-center justify-center gap-1 text-sm transition-all"
                    >
                      <Plus size={14} /> Añadir
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {form.opciones.colores.map((c) => (
                    <div key={c.id} className="bg-green-500/5 border border-green-500/30 rounded-lg p-3 min-w-[180px]">
                      <div className="flex items-center gap-2 mb-2">
                        <div 
                          className="w-6 h-6 rounded-full border border-gray-600 flex-shrink-0"
                          style={{ backgroundColor: c.codigoColor || '#2ecc71' }}
                        />
                        <input
                          value={c.nombre}
                          onChange={(e) => updateColor(c.id, 'nombre', e.target.value)}
                          className="bg-transparent text-white text-sm w-20 focus:outline-none"
                        />
                        <span className="text-green-400 text-xs">+</span>
                        <input
                          type="number"
                          value={c.precioExtra === 0 ? '' : c.precioExtra}
                          onChange={(e) => updateColor(c.id, 'precioExtra', e.target.value === '' ? 0 : Number(e.target.value))}
                          className="bg-transparent text-green-400 text-sm w-10 focus:outline-none"
                          min="0"
                        />
                        <span className="text-gray-500 text-xs">€</span>
                        <input
                          type="number"
                          value={c.stock === 0 ? '' : c.stock}
                          onChange={(e) => updateColor(c.id, 'stock', e.target.value === '' ? 0 : Number(e.target.value))}
                          className="bg-transparent text-gray-400 text-sm w-12 focus:outline-none"
                          placeholder="Stock"
                          min="0"
                        />
                        <button onClick={() => eliminarColor(c.id)} className="text-red-500 hover:text-red-400 ml-auto">
                          <X size={14} />
                        </button>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {c.imagenes && c.imagenes.map((img, idx) => (
                          <div key={idx} className="relative w-14 h-14 rounded border border-gray-700 overflow-hidden group">
                            <img src={img} className="w-full h-full object-cover" />
                            <button
                              onClick={() => removeColorImage(c.id, idx)}
                              className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={8} />
                            </button>
                          </div>
                        ))}
                        <label className="w-14 h-14 flex flex-col items-center justify-center bg-black/50 border border-dashed border-gray-700 rounded cursor-pointer hover:border-green-500/50 transition-colors">
                          <Upload size={14} className="text-gray-500" />
                          <span className="text-[6px] text-gray-500 mt-0.5">Subir</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => e.target.files?.[0] && addColorImage(c.id, e.target.files[0])}
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ============================================================
          ✅ SECCIÓN 5: STOCK POR COMBINACIÓN
          ============================================================ */}
          {combinaciones.length > 0 && (
            <div className="border-b border-green-900/20 pb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-cyan-400 text-sm font-semibold flex items-center gap-2">
                  <AlertCircle size={16} />
                  📦 5. STOCK POR COMBINACIÓN
                  <span className="text-xs bg-cyan-500/20 text-cyan-500 px-2 py-0.5 rounded-full">
                    {combinaciones.length}
                  </span>
                </h3>
                <button
                  onClick={() => setMostrarStockCombinaciones(!mostrarStockCombinaciones)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {mostrarStockCombinaciones ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
              </div>
              <p className="text-gray-500 text-xs mb-2">
                Edita el stock de cada combinación de variantes.
              </p>
              
              {mostrarStockCombinaciones && (
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                  <div className="grid grid-cols-12 gap-2 text-[10px] text-gray-500 font-semibold px-2 mb-1">
                    <div className="col-span-3">⚡ Voltaje</div>
                    <div className="col-span-3">🔋 Potencia</div>
                    <div className="col-span-2">🔌 Amperios</div>
                    <div className="col-span-2">🎨 Color</div>
                    <div className="col-span-2 text-right">📦 Stock</div>
                  </div>
                  
                  {combinaciones.map((c, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center bg-gray-900/30 rounded-lg px-3 py-2 border border-gray-800/50 hover:border-cyan-500/30 transition-colors">
                      <div className="col-span-3 text-white text-sm truncate">{c.voltaje}</div>
                      <div className="col-span-3 text-white text-sm truncate">{c.potencia}</div>
                      <div className="col-span-2 text-white text-sm truncate">{c.amperio}</div>
                      <div className="col-span-2 flex items-center gap-2 text-white text-sm truncate">
                        <span 
                          className="w-3 h-3 rounded-full border border-gray-600 flex-shrink-0"
                          style={{ backgroundColor: c.colorCodigo }}
                        />
                        {c.color}
                      </div>
                      <div className="col-span-2 flex items-center justify-end gap-2">
                        <input
                          type="number"
                          value={c.stock}
                          onChange={(e) => {
                            const newStock = parseInt(e.target.value) || 0;
                            actualizarStockCombinacion(
                              c.voltajeId,
                              c.potenciaId,
                              c.amperioId,
                              c.colorId,
                              newStock
                            );
                          }}
                          className={`w-16 bg-black/50 border rounded-lg px-2 py-1 text-sm text-center outline-none ${
                            c.stock === 0 
                              ? 'border-red-500/50 text-red-500' 
                              : c.stock <= 3 
                              ? 'border-yellow-500/50 text-yellow-500' 
                              : 'border-green-500/50 text-white'
                          }`}
                          min="0"
                        />
                        <span className="text-[10px] text-gray-500 w-16">
                          {c.stock === 0 
                            ? '🔴 AGOTADO' 
                            : c.stock <= 3 
                            ? '🟡 ¡ÚLTIMAS!' 
                            : '✅ Disponible'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ============================================================
          SECCIÓN 6: IMÁGENES GENERALES
          ============================================================ */}
          <div className="border-b border-green-900/20 pb-4">
            <h3 className="text-blue-400 text-sm font-semibold flex items-center gap-2 mb-2">
              <Upload size={16} />
              📷 6. IMÁGENES GENERALES DEL PRODUCTO
            </h3>
            <p className="text-gray-500 text-xs mb-2">
              Sube imágenes adicionales del producto.
            </p>
            <div className="flex flex-wrap gap-2 mb-2">
              {form.imagenes.map((img, i) => (
                <div key={i} className="relative w-20 h-20 group">
                  <img src={img} className="w-full h-full object-cover rounded-lg border border-green-900/30" />
                  <button 
                    onClick={() => removeImage(i)} 
                    className="absolute -top-1 -right-1 bg-red-500 rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              <label className="w-20 h-20 flex flex-col items-center justify-center bg-black/50 border-2 border-dashed border-green-900/30 rounded-lg cursor-pointer hover:border-green-500/50 transition-colors">
                <Upload size={20} className="text-gray-500" />
                <span className="text-[8px] text-gray-500 mt-1">Subir</span>
                <input type="file" multiple accept="image/*" onChange={(e) => handleImageUpload(e.target.files)} className="hidden" />
              </label>
            </div>
            {uploading && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <RefreshCw size={14} className="animate-spin" />
                Subiendo imágenes...
              </div>
            )}
          </div>

          {/* ============================================================
          SECCIÓN 7: ESPECIFICACIONES TÉCNICAS (CORREGIDA)
          ============================================================ */}
          <div className="border-b border-green-900/20 pb-4">
            <h3 className="text-cyan-400 text-sm font-semibold flex items-center gap-2 mb-2">
              <FileText size={16} />
              📋 7. ESPECIFICACIONES TÉCNICAS
            </h3>
            <p className="text-gray-500 text-xs mb-2">
              Escribe el nombre y el valor de cada especificación. Se traducirán automáticamente al guardar.
            </p>
            
            <div className="space-y-2">
              {Object.entries(form.especificaciones || {})
                .filter(([key]) => !key.endsWith('_en') && !key.endsWith('_gr') && !key.endsWith('_en_value') && !key.endsWith('_gr_value'))
                .map(([key, value]) => (
                  <div key={key} className="flex gap-2">
                    <input
                      type="text"
                      value={key}
                      onChange={(e) => {
                        const newEspec = { ...form.especificaciones };
                        const oldValue = newEspec[key];
                        delete newEspec[key];
                        newEspec[e.target.value] = oldValue;
                        setForm({ ...form, especificaciones: newEspec });
                      }}
                      className="flex-1 bg-black/50 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500/50 outline-none"
                      placeholder="Ej: Velocidad máxima"
                    />
                    <input
                      type="text"
                      value={value as string}
                      onChange={(e) => {
                        const newEspec = { ...form.especificaciones };
                        newEspec[key] = e.target.value;
                        setForm({ ...form, especificaciones: newEspec });
                      }}
                      className="flex-1 bg-black/50 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500/50 outline-none"
                      placeholder="Ej: 25 km/h"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newEspec = { ...form.especificaciones };
                        delete newEspec[key];
                        delete newEspec[`${key}_en`];
                        delete newEspec[`${key}_gr`];
                        delete newEspec[`${key}_en_value`];
                        delete newEspec[`${key}_gr_value`];
                        setForm({ ...form, especificaciones: newEspec });
                      }}
                      className="p-2 text-red-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              
              <button
                type="button"
                onClick={() => {
                  const newEspec = { ...form.especificaciones };
                  const newKey = `espec_${Date.now()}`;
                  newEspec[newKey] = '';
                  setForm({ ...form, especificaciones: newEspec });
                }}
                className="w-full py-2 bg-black/50 border border-dashed border-gray-700 rounded-lg hover:border-cyan-500/50 text-gray-400 text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <Plus size={14} /> Agregar especificación
              </button>
            </div>
          </div>

          {/* ============================================================
          SECCIÓN 8: BADGES
          ============================================================ */}
          <div className="border-b border-green-900/20 pb-4">
            <h3 className="text-yellow-400 text-sm font-semibold flex items-center gap-2 mb-2">
              <Star size={16} />
              ⭐ 8. BADGES Y DESTACADOS
            </h3>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.masVendido} onChange={(e) => setForm({ ...form, masVendido: e.target.checked })} className="w-4 h-4 accent-yellow-500" />
                <Star size={16} className="text-yellow-500" />
                <span className="text-sm">⭐ Más vendido</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.nuevo} onChange={(e) => setForm({ ...form, nuevo: e.target.checked })} className="w-4 h-4 accent-green-500" />
                <Sparkles size={16} className="text-green-400" />
                <span className="text-sm">✨ Nuevo</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.rebaja} onChange={(e) => setForm({ ...form, rebaja: e.target.checked })} className="w-4 h-4 accent-red-500" />
                <Percent size={16} className="text-red-400" />
                <span className="text-sm">🔥 En oferta</span>
              </label>
            </div>
          </div>

          {/* ============================================================
          ✅ SECCIÓN 9: RESUMEN (CORREGIDA)
          ============================================================ */}
          <div>
            <h3 className="text-gray-400 text-sm font-semibold flex items-center gap-2 mb-2">
              <Package size={16} />
              📊 9. RESUMEN DE STOCK
            </h3>
            <div className="bg-gray-900/30 rounded-xl p-3 border border-gray-800/50">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                <div>
                  <p className="text-[10px] text-gray-500">🎨 Colores</p>
                  <p className="text-white font-bold">{form.opciones.colores?.length || 0}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500">⚡ Voltajes</p>
                  <p className="text-white font-bold">{form.opciones.voltajes?.length || 0}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500">🔌 Amperios</p>
                  <p className="text-white font-bold">{form.opciones.amperios?.length || 0}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500">🔋 Potencias</p>
                  <p className="text-white font-bold">{form.opciones.potencias?.length || 0}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500">📦 Combinaciones</p>
                  <p className="text-white font-bold">{combinaciones.length}</p>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-gray-800/50">
                <p className="text-[10px] text-gray-500">💡 Los mensajes de stock se mostrarán en la web:</p>
                <div className="flex flex-wrap gap-4 mt-1 text-xs">
                  <span className="text-red-500">0 = AGOTADO</span>
                  <span className="text-yellow-500">1-3 = ¡ÚLTIMAS UNIDADES!</span>
                  <span className="text-white">4+ = Disponible</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminProductForm;