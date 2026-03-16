import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/firebase/config';
import { translateToAll } from '@/services/translationService';
import AdminNavBack from '@/components/AdminNavBack';
import {
  Save, ArrowLeft, Upload, X, Plus, Trash2,
  Image as ImageIcon, Globe, Check, AlertCircle,
  RefreshCw, Tag, Star, Percent, Package, Euro,
  FileText, Settings, Wrench, Battery, Zap,
  Gauge, Weight, Ruler, Calendar, Hash, Box
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Categoria {
  id: string;
  nombre: string;
  nombre_en?: string;
  nombre_gr?: string;
}

interface Especificacion {
  nombre: string;
  valor: string;
  unidad?: string;
}

const AdminProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { t, lang } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [activeTab, setActiveTab] = useState('basico');
  
  const [formData, setFormData] = useState({
    // Información básica
    nombre: '',
    nombre_en: '',
    nombre_gr: '',
    sku: '',
    marca: '',
    
    // Precios y stock
    precio: 0,
    precioOferta: 0,
    enOferta: false,
    descuento: 0,
    stock: 0,
    
    // Categoría
    categoria: '',
    
    // Descripción
    descripcion: '',
    descripcion_en: '',
    descripcion_gr: '',
    
    // Especificaciones técnicas
    especificaciones: [] as Especificacion[],
    especificaciones_en: [] as Especificacion[],
    especificaciones_gr: [] as Especificacion[],
    
    // Características
    caracteristicas: [] as string[],
    
    // Imágenes
    imagenes: [] as string[],
    
    // Etiquetas
    masVendido: false,
    nuevo: false,
    destacado: false,
    
    // Dimensiones y peso
    peso: '',
    dimensiones: '',
    
    // Garantía
    garantia: '',
    
    // SEO
    metaTitulo: '',
    metaDescripcion: '',
    keywords: [] as string[]
  });

  // Especificaciones predefinidas
  const especificacionesComunes = [
    { nombre: 'Batería', unidad: 'Ah', icon: Battery },
    { nombre: 'Autonomía', unidad: 'km', icon: Zap },
    { nombre: 'Potencia', unidad: 'W', icon: Gauge },
    { nombre: 'Velocidad máxima', unidad: 'km/h', icon: Gauge },
    { nombre: 'Peso', unidad: 'kg', icon: Weight },
    { nombre: 'Dimensiones', unidad: 'cm', icon: Ruler },
    { nombre: 'Año', unidad: '', icon: Calendar },
    { nombre: 'Modelo', unidad: '', icon: Hash },
  ];

  useEffect(() => {
    loadCategorias();
    if (id && id !== 'nuevo') {
      loadProduct();
    }
  }, [id]);

  const loadCategorias = async () => {
    try {
      const snap = await getDocs(collection(db, "categorias"));
      const cats = snap.docs.map(d => ({ id: d.id, ...d.data() } as Categoria));
      setCategorias(cats);
    } catch (error) {
      console.error("Error cargando categorías:", error);
    }
  };

  const loadProduct = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, "productos", id!);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFormData({
          nombre: data.nombre || '',
          nombre_en: data.nombre_en || '',
          nombre_gr: data.nombre_gr || '',
          sku: data.sku || '',
          marca: data.marca || '',
          precio: data.precio || 0,
          precioOferta: data.precioOferta || 0,
          enOferta: data.enOferta || false,
          descuento: data.descuento || 0,
          stock: data.stock || 0,
          categoria: data.categoria || '',
          descripcion: data.descripcion || '',
          descripcion_en: data.descripcion_en || '',
          descripcion_gr: data.descripcion_gr || '',
          especificaciones: data.especificaciones || [],
          especificaciones_en: data.especificaciones_en || [],
          especificaciones_gr: data.especificaciones_gr || [],
          caracteristicas: data.caracteristicas || [],
          imagenes: data.imagenes || [],
          masVendido: data.masVendido || false,
          nuevo: data.nuevo || false,
          destacado: data.destacado || false,
          peso: data.peso || '',
          dimensiones: data.dimensiones || '',
          garantia: data.garantia || '',
          metaTitulo: data.metaTitulo || '',
          metaDescripcion: data.metaDescripcion || '',
          keywords: data.keywords || []
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cargar el producto",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    const uploadPromises = Array.from(files).map(async (file) => {
      const storageRef = ref(storage, `productos/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      return await getDownloadURL(storageRef);
    });

    try {
      const urls = await Promise.all(uploadPromises);
      setFormData({
        ...formData,
        imagenes: [...formData.imagenes, ...urls]
      });
      toast({
        title: "Éxito",
        description: "Imágenes subidas correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron subir las imágenes",
        variant: "destructive",
      });
    }
    setUploadingImages(false);
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      imagenes: formData.imagenes.filter((_, i) => i !== index)
    });
  };

  const addEspecificacion = (lang: 'es' | 'en' | 'gr' = 'es') => {
    const field = lang === 'es' ? 'especificaciones' : lang === 'en' ? 'especificaciones_en' : 'especificaciones_gr';
    setFormData({
      ...formData,
      [field]: [...(formData[field] || []), { nombre: '', valor: '', unidad: '' }]
    });
  };

  const removeEspecificacion = (index: number, lang: 'es' | 'en' | 'gr' = 'es') => {
    const field = lang === 'es' ? 'especificaciones' : lang === 'en' ? 'especificaciones_en' : 'especificaciones_gr';
    setFormData({
      ...formData,
      [field]: (formData[field] || []).filter((_, i) => i !== index)
    });
  };

  const updateEspecificacion = (index: number, campo: keyof Especificacion, valor: string, lang: 'es' | 'en' | 'gr' = 'es') => {
    const field = lang === 'es' ? 'especificaciones' : lang === 'en' ? 'especificaciones_en' : 'especificaciones_gr';
    const nuevas = [...(formData[field] || [])];
    nuevas[index] = { ...nuevas[index], [campo]: valor };
    setFormData({
      ...formData,
      [field]: nuevas
    });
  };

  const addCaracteristica = () => {
    setFormData({
      ...formData,
      caracteristicas: [...formData.caracteristicas, '']
    });
  };

  const removeCaracteristica = (index: number) => {
    setFormData({
      ...formData,
      caracteristicas: formData.caracteristicas.filter((_, i) => i !== index)
    });
  };

  const updateCaracteristica = (index: number, valor: string) => {
    const nuevas = [...formData.caracteristicas];
    nuevas[index] = valor;
    setFormData({
      ...formData,
      caracteristicas: nuevas
    });
  };

  const addKeyword = () => {
    setFormData({
      ...formData,
      keywords: [...formData.keywords, '']
    });
  };

  const removeKeyword = (index: number) => {
    setFormData({
      ...formData,
      keywords: formData.keywords.filter((_, i) => i !== index)
    });
  };

  const updateKeyword = (index: number, valor: string) => {
    const nuevas = [...formData.keywords];
    nuevas[index] = valor;
    setFormData({
      ...formData,
      keywords: nuevas
    });
  };

  const handleTranslate = async () => {
    setTranslating(true);
    try {
      // Traducir nombre
      if (formData.nombre) {
        const nombreTrans = await translateToAll(formData.nombre, 'es');
        setFormData(prev => ({
          ...prev,
          nombre: nombreTrans.es,
          nombre_en: nombreTrans.en,
          nombre_gr: nombreTrans.gr
        }));
      }

      // Traducir descripción
      if (formData.descripcion) {
        const descTrans = await translateToAll(formData.descripcion, 'es');
        setFormData(prev => ({
          ...prev,
          descripcion: descTrans.es,
          descripcion_en: descTrans.en,
          descripcion_gr: descTrans.gr
        }));
      }

      // Traducir especificaciones (simplificado)
      toast({
        title: "Traducción completada",
        description: "Campos principales traducidos",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo completar la traducción",
        variant: "destructive",
      });
    }
    setTranslating(false);
  };

  const handleSave = async () => {
    if (!formData.nombre || !formData.precio || !formData.categoria) {
      toast({
        title: "Campos requeridos",
        description: "Nombre, precio y categoría son obligatorios",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const productId = id && id !== 'nuevo' ? id : Date.now().toString();
      const docRef = doc(db, "productos", productId);
      
      await setDoc(docRef, {
        ...formData,
        updatedAt: new Date()
      });

      toast({
        title: "Éxito",
        description: id === 'nuevo' ? "Producto creado" : "Producto actualizado",
        className: "bg-green-500 text-white",
      });
      
      navigate('/admin/dashboard');
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar el producto",
        variant: "destructive",
      });
    }
    setSaving(false);
  };

  if (!user || !isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const getText = (es: string, en: string, gr: string) => {
    if (lang === 'en') return en;
    if (lang === 'gr') return gr;
    return es;
  };

  const tabs = [
    { id: 'basico', nombre: '📋 Básico', icon: FileText },
    { id: 'especificaciones', nombre: '⚙️ Especificaciones', icon: Settings },
    { id: 'imagenes', nombre: '🖼️ Imágenes', icon: ImageIcon },
    { id: 'etiquetas', nombre: '🏷️ Etiquetas', icon: Tag },
    { id: 'seo', nombre: '🔍 SEO', icon: Globe },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <AdminNavBack 
            title={id === 'nuevo' 
              ? getText('Nuevo Producto', 'New Product', 'Νέο Προϊόν')
              : getText('Editar Producto', 'Edit Product', 'Επεξεργασία Προϊόντος')}
            description={getText(
              'Completa la información en 3 idiomas',
              'Complete information in 3 languages',
              'Συμπληρώστε πληροφορίες σε 3 γλώσσες'
            )}
          />

          <div className="mt-4 flex flex-col sm:flex-row justify-end gap-3">
            <button
              onClick={handleTranslate}
              disabled={translating}
              className="px-6 py-3 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <Globe size={18} />
              {translating ? 'Traduciendo...' : 'Auto-traducir'}
            </button>
            
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center gap-2 text-base sm:text-lg font-bold shadow-lg shadow-green-500/30"
            >
              <Save size={20} />
              {saving ? 'Guardando...' : 'Guardar Producto'}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400">{getText('Cargando...', 'Loading...', 'Φόρτωση...')}</p>
          </div>
        ) : (
          <>
            {/* Tabs de navegación */}
            <div className="mb-6 flex flex-wrap gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                      activeTab === tab.id
                        ? 'bg-primary text-white'
                        : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    <Icon size={16} />
                    <span className="text-sm">{tab.nombre}</span>
                  </button>
                );
              })}
            </div>

            {/* Contenido según tab */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
              {/* TAB BÁSICO */}
              {activeTab === 'basico' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-display font-semibold text-white mb-4">
                    {getText('Información Básica', 'Basic Information', 'Βασικές Πληροφορίες')}
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* SKU */}
                    <div>
                      <label className="block text-sm text-slate-400 mb-2 flex items-center gap-2">
                        <Hash size={14} /> SKU
                      </label>
                      <input
                        type="text"
                        value={formData.sku}
                        onChange={(e) => setFormData({...formData, sku: e.target.value})}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white"
                        placeholder="Ej: PAT-001"
                      />
                    </div>

                    {/* Marca */}
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Marca</label>
                      <input
                        type="text"
                        value={formData.marca}
                        onChange={(e) => setFormData({...formData, marca: e.target.value})}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white"
                        placeholder="Ej: Xiaomi, Segway, etc."
                      />
                    </div>

                    {/* Nombre 3 idiomas */}
                    <div>
                      <label className="block text-sm text-slate-400 mb-2 flex items-center gap-2">
                        <span className="text-xl">🇪🇸</span> Nombre (Español) *
                      </label>
                      <input
                        type="text"
                        value={formData.nombre}
                        onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white"
                        placeholder="Nombre en español"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-slate-400 mb-2 flex items-center gap-2">
                        <span className="text-xl">🇬🇧</span> Name (English)
                      </label>
                      <input
                        type="text"
                        value={formData.nombre_en}
                        onChange={(e) => setFormData({...formData, nombre_en: e.target.value})}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white"
                        placeholder="English name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-slate-400 mb-2 flex items-center gap-2">
                        <span className="text-xl">🇬🇷</span> Όνομα (Ελληνικά)
                      </label>
                      <input
                        type="text"
                        value={formData.nombre_gr}
                        onChange={(e) => setFormData({...formData, nombre_gr: e.target.value})}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white"
                        placeholder="Ελληνικό όνομα"
                      />
                    </div>

                    {/* Precio y stock */}
                    <div>
                      <label className="block text-sm text-slate-400 mb-2 flex items-center gap-2">
                        <Euro size={14} /> Precio *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.precio}
                        onChange={(e) => setFormData({...formData, precio: parseFloat(e.target.value)})}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-slate-400 mb-2 flex items-center gap-2">
                        <Box size={14} /> Stock
                      </label>
                      <input
                        type="number"
                        value={formData.stock}
                        onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value)})}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white"
                      />
                    </div>

                    {/* Categoría */}
                    <div className="md:col-span-2">
                      <label className="block text-sm text-slate-400 mb-2">Categoría *</label>
                      <select
                        value={formData.categoria}
                        onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white"
                        required
                      >
                        <option value="">Seleccionar categoría</option>
                        {categorias.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Descripción 3 idiomas */}
                    <div className="md:col-span-2">
                      <label className="block text-sm text-slate-400 mb-2">Descripción (Español)</label>
                      <textarea
                        value={formData.descripcion}
                        onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                        rows={4}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white resize-none"
                        placeholder="Descripción en español..."
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm text-slate-400 mb-2">Description (English)</label>
                      <textarea
                        value={formData.descripcion_en}
                        onChange={(e) => setFormData({...formData, descripcion_en: e.target.value})}
                        rows={4}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white resize-none"
                        placeholder="English description..."
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm text-slate-400 mb-2">Περιγραφή (Ελληνικά)</label>
                      <textarea
                        value={formData.descripcion_gr}
                        onChange={(e) => setFormData({...formData, descripcion_gr: e.target.value})}
                        rows={4}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white resize-none"
                        placeholder="Ελληνική περιγραφή..."
                      />
                    </div>

                    {/* Peso y dimensiones */}
                    <div>
                      <label className="block text-sm text-slate-400 mb-2 flex items-center gap-2">
                        <Weight size={14} /> Peso
                      </label>
                      <input
                        type="text"
                        value={formData.peso}
                        onChange={(e) => setFormData({...formData, peso: e.target.value})}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white"
                        placeholder="Ej: 15 kg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-slate-400 mb-2 flex items-center gap-2">
                        <Ruler size={14} /> Dimensiones
                      </label>
                      <input
                        type="text"
                        value={formData.dimensiones}
                        onChange={(e) => setFormData({...formData, dimensiones: e.target.value})}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white"
                        placeholder="Ej: 120x60x50 cm"
                      />
                    </div>

                    {/* Garantía */}
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Garantía</label>
                      <input
                        type="text"
                        value={formData.garantia}
                        onChange={(e) => setFormData({...formData, garantia: e.target.value})}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white"
                        placeholder="Ej: 2 años"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB ESPECIFICACIONES */}
              {activeTab === 'especificaciones' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-display font-semibold text-white mb-4">
                    {getText('Especificaciones Técnicas', 'Technical Specifications', 'Τεχνικές Προδιαγραφές')}
                  </h2>

                  {/* Español */}
                  <div className="space-y-4">
                    <h3 className="text-lg text-white flex items-center gap-2">
                      <span className="text-xl">🇪🇸</span> Especificaciones (Español)
                    </h3>
                    
                    {(formData.especificaciones || []).map((esp, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <select
                          value={esp.nombre}
                          onChange={(e) => updateEspecificacion(index, 'nombre', e.target.value, 'es')}
                          className="w-48 bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white"
                        >
                          <option value="">Seleccionar</option>
                          {especificacionesComunes.map((e) => (
                            <option key={e.nombre} value={e.nombre}>{e.nombre}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={esp.valor}
                          onChange={(e) => updateEspecificacion(index, 'valor', e.target.value, 'es')}
                          className="flex-1 bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white"
                          placeholder="Valor"
                        />
                        <input
                          type="text"
                          value={esp.unidad || ''}
                          onChange={(e) => updateEspecificacion(index, 'unidad', e.target.value, 'es')}
                          className="w-24 bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white"
                          placeholder="Unidad"
                        />
                        <button
                          onClick={() => removeEspecificacion(index, 'es')}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    
                    <button
                      onClick={() => addEspecificacion('es')}
                      className="flex items-center gap-2 text-primary hover:text-primary/80"
                    >
                      <Plus size={16} /> Añadir especificación
                    </button>
                  </div>

                  {/* Inglés */}
                  <div className="space-y-4 pt-4 border-t border-slate-700">
                    <h3 className="text-lg text-white flex items-center gap-2">
                      <span className="text-xl">🇬🇧</span> Specifications (English)
                    </h3>
                    
                    {(formData.especificaciones_en || []).map((esp, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={esp.nombre}
                          onChange={(e) => updateEspecificacion(index, 'nombre', e.target.value, 'en')}
                          className="w-48 bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white"
                          placeholder="Name"
                        />
                        <input
                          type="text"
                          value={esp.valor}
                          onChange={(e) => updateEspecificacion(index, 'valor', e.target.value, 'en')}
                          className="flex-1 bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white"
                          placeholder="Value"
                        />
                        <input
                          type="text"
                          value={esp.unidad || ''}
                          onChange={(e) => updateEspecificacion(index, 'unidad', e.target.value, 'en')}
                          className="w-24 bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white"
                          placeholder="Unit"
                        />
                        <button
                          onClick={() => removeEspecificacion(index, 'en')}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    
                    <button
                      onClick={() => addEspecificacion('en')}
                      className="flex items-center gap-2 text-primary hover:text-primary/80"
                    >
                      <Plus size={16} /> Add specification
                    </button>
                  </div>

                  {/* Griego */}
                  <div className="space-y-4 pt-4 border-t border-slate-700">
                    <h3 className="text-lg text-white flex items-center gap-2">
                      <span className="text-xl">🇬🇷</span> Προδιαγραφές (Ελληνικά)
                    </h3>
                    
                    {(formData.especificaciones_gr || []).map((esp, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={esp.nombre}
                          onChange={(e) => updateEspecificacion(index, 'nombre', e.target.value, 'gr')}
                          className="w-48 bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white"
                          placeholder="Όνομα"
                        />
                        <input
                          type="text"
                          value={esp.valor}
                          onChange={(e) => updateEspecificacion(index, 'valor', e.target.value, 'gr')}
                          className="flex-1 bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white"
                          placeholder="Τιμή"
                        />
                        <input
                          type="text"
                          value={esp.unidad || ''}
                          onChange={(e) => updateEspecificacion(index, 'unidad', e.target.value, 'gr')}
                          className="w-24 bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white"
                          placeholder="Μονάδα"
                        />
                        <button
                          onClick={() => removeEspecificacion(index, 'gr')}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    
                    <button
                      onClick={() => addEspecificacion('gr')}
                      className="flex items-center gap-2 text-primary hover:text-primary/80"
                    >
                      <Plus size={16} /> Προσθήκη προδιαγραφής
                    </button>
                  </div>

                  {/* Características */}
                  <div className="pt-4 border-t border-slate-700">
                    <h3 className="text-lg text-white mb-4">Características destacadas</h3>
                    
                    {formData.caracteristicas.map((car, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={car}
                          onChange={(e) => updateCaracteristica(index, e.target.value)}
                          className="flex-1 bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white"
                          placeholder="Característica"
                        />
                        <button
                          onClick={() => removeCaracteristica(index)}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                    
                    <button
                      onClick={addCaracteristica}
                      className="flex items-center gap-2 text-primary hover:text-primary/80"
                    >
                      <Plus size={16} /> Añadir característica
                    </button>
                  </div>
                </div>
              )}

              {/* TAB IMÁGENES */}
              {activeTab === 'imagenes' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-display font-semibold text-white mb-4">
                    {getText('Galería de Imágenes', 'Image Gallery', 'Γκαλερί Εικόνων')}
                  </h2>

                  <label className="block">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="imageUpload"
                    />
                    <div
                      onClick={() => document.getElementById('imageUpload')?.click()}
                      className="border-2 border-dashed border-slate-700 rounded-xl p-12 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    >
                      <Upload size={32} className="mx-auto mb-4 text-slate-500" />
                      <p className="text-slate-400">Haz clic para subir imágenes</p>
                      <p className="text-sm text-slate-600 mt-2">PNG, JPG, WEBP hasta 5MB</p>
                    </div>
                  </label>

                  {uploadingImages && (
                    <div className="text-center py-4">
                      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.imagenes.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Producto ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-slate-700"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={14} className="text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB ETIQUETAS */}
              {activeTab === 'etiquetas' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-display font-semibold text-white mb-4">
                    {getText('Etiquetas y Promociones', 'Tags & Promotions', 'Ετικέτες και Προσφορές')}
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <label className="flex items-center gap-3 p-4 bg-slate-900/30 rounded-xl border border-slate-700">
                        <input
                          type="checkbox"
                          checked={formData.masVendido}
                          onChange={(e) => setFormData({...formData, masVendido: e.target.checked})}
                          className="accent-primary w-5 h-5"
                        />
                        <span className="text-white">⭐ Producto más vendido</span>
                      </label>

                      <label className="flex items-center gap-3 p-4 bg-slate-900/30 rounded-xl border border-slate-700">
                        <input
                          type="checkbox"
                          checked={formData.nuevo}
                          onChange={(e) => setFormData({...formData, nuevo: e.target.checked})}
                          className="accent-primary w-5 h-5"
                        />
                        <span className="text-white">🆕 Novedad</span>
                      </label>

                      <label className="flex items-center gap-3 p-4 bg-slate-900/30 rounded-xl border border-slate-700">
                        <input
                          type="checkbox"
                          checked={formData.destacado}
                          onChange={(e) => setFormData({...formData, destacado: e.target.checked})}
                          className="accent-primary w-5 h-5"
                        />
                        <span className="text-white">✨ Producto destacado</span>
                      </label>
                    </div>

                    <div className="space-y-4">
                      <label className="flex items-center gap-3 p-4 bg-slate-900/30 rounded-xl border border-slate-700">
                        <input
                          type="checkbox"
                          checked={formData.enOferta}
                          onChange={(e) => setFormData({...formData, enOferta: e.target.checked})}
                          className="accent-primary w-5 h-5"
                        />
                        <span className="text-white">🏷️ En oferta</span>
                      </label>

                      {formData.enOferta && (
                        <div className="p-4 bg-slate-900/30 rounded-xl border border-slate-700">
                          <label className="block text-sm text-slate-400 mb-2">Descuento (%)</label>
                          <input
                            type="number"
                            value={formData.descuento}
                            onChange={(e) => setFormData({...formData, descuento: parseInt(e.target.value)})}
                            min="0"
                            max="100"
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                          />
                          {formData.precio > 0 && formData.descuento > 0 && (
                            <p className="text-sm text-green-500 mt-2">
                              Precio final: €{(formData.precio * (1 - formData.descuento / 100)).toFixed(2)}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB SEO */}
              {activeTab === 'seo' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-display font-semibold text-white mb-4">
                    {getText('Optimización SEO', 'SEO Optimization', 'Βελτιστοποίηση SEO')}
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Meta Título</label>
                      <input
                        type="text"
                        value={formData.metaTitulo}
                        onChange={(e) => setFormData({...formData, metaTitulo: e.target.value})}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white"
                        placeholder="Título para SEO (máx. 60 caracteres)"
                        maxLength={60}
                      />
                      <p className="text-xs text-slate-500 mt-1">{formData.metaTitulo.length}/60</p>
                    </div>

                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Meta Descripción</label>
                      <textarea
                        value={formData.metaDescripcion}
                        onChange={(e) => setFormData({...formData, metaDescripcion: e.target.value})}
                        rows={3}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white resize-none"
                        placeholder="Descripción para SEO (máx. 160 caracteres)"
                        maxLength={160}
                      />
                      <p className="text-xs text-slate-500 mt-1">{formData.metaDescripcion.length}/160</p>
                    </div>

                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Palabras clave</label>
                      {formData.keywords.map((kw, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={kw}
                            onChange={(e) => updateKeyword(index, e.target.value)}
                            className="flex-1 bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white"
                            placeholder="Palabra clave"
                          />
                          <button
                            onClick={() => removeKeyword(index)}
                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={addKeyword}
                        className="flex items-center gap-2 text-primary hover:text-primary/80"
                      >
                        <Plus size={16} /> Añadir palabra clave
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminProductForm;