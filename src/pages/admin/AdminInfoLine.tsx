import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Navigate } from 'react-router-dom';
import { getInfoLine, updateInfoLine, InfoLineData } from '@/services/infoLineService';
import { translateToAll } from '@/services/translationService';
import AdminNavBack from '@/components/AdminNavBack';
import {
  Save, Info, Palette, Link as LinkIcon,
  Type, MoveHorizontal, ArrowLeftRight,
  ArrowUp, ArrowDown, Eye, Activity, Copy, Check,
  Minus, Plus, Move, ChevronDown, ChevronUp,
  Monitor, Settings, Clock, Globe, MessageSquare,
  Layout, EyeOff, Play, Pause, AlertCircle, RefreshCw
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const AdminInfoLine = () => {
  const { user, isAdmin } = useAuth();
  const { lang } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] = useState<InfoLineData | null>(null);
  
  const [showFondoColors, setShowFondoColors] = useState(false);
  const [showTextoColors, setShowTextoColors] = useState(false);
  
  const [formData, setFormData] = useState<InfoLineData>({
    texto: '',
    texto_en: '',
    texto_gr: '',
    color: '#2ecc71',
    colorTexto: '#ffffff',
    tamanoTexto: 16,
    altoLinea: 28,
    tipoLetra: 'inherit',
    velocidad: 200, // 👈 CAMBIADO a 200 por defecto (dentro del nuevo rango)
    direccion: 'left',
    posicion: 'top',
    activo: true,
    link: ''
  });

  const colorGamas = [
    {
      nombre: 'Verdes',
      colores: ['#2ecc71', '#27ae60', '#16a085', '#1abc9c', '#2c3e50']
    },
    {
      nombre: 'Azules',
      colores: ['#3498db', '#2980b9', '#34495e', '#5dade2', '#2874a6']
    },
    {
      nombre: 'Rojos',
      colores: ['#e74c3c', '#c0392b', '#e67e22', '#d35400', '#f39c12']
    },
    {
      nombre: 'Morados',
      colores: ['#9b59b6', '#8e44ad', '#6c3483', '#bb8fce', '#76448a']
    },
    {
      nombre: 'Grises',
      colores: ['#ecf0f1', '#bdc3c7', '#95a5a6', '#7f8c8d', '#2c3e50']
    },
    {
      nombre: 'Neón',
      colores: ['#00ff00', '#ff00ff', '#00ffff', '#ffff00', '#ff6600']
    }
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (originalData) {
      const changed = JSON.stringify(formData) !== JSON.stringify(originalData);
      setHasChanges(changed);
    }
  }, [formData, originalData]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getInfoLine();
      setFormData(data);
      setOriginalData(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cargar la configuración",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateInfoLine(formData);
      setOriginalData(formData);
      setHasChanges(false);
      toast({
        title: "Éxito",
        description: "Línea informativa actualizada correctamente",
        className: "bg-green-500 text-white",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar",
        variant: "destructive",
      });
    }
    setSaving(false);
  };

  const handleReset = () => {
    if (originalData) {
      setFormData(originalData);
      toast({
        title: "Cambios descartados",
        description: "Se restauró la configuración anterior",
      });
    }
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleTranslateFrom = async (sourceLang: 'es' | 'en' | 'gr', sourceText: string) => {
    if (!sourceText || sourceText.length < 3) {
      toast({
        title: "Texto demasiado corto",
        description: "Escribe al menos 3 caracteres para traducir",
        variant: "destructive",
      });
      return;
    }

    try {
      const translations = await translateToAll(sourceText, sourceLang);
      setFormData({
        ...formData,
        texto: translations.es,
        texto_en: translations.en,
        texto_gr: translations.gr
      });
      toast({
        title: "Traducción completada",
        description: "Texto traducido a todos los idiomas",
      });
    } catch (error) {
      toast({
        title: "Error de traducción",
        description: "No se pudo completar la traducción",
        variant: "destructive",
      });
    }
  };

  if (!user || !isAdmin) return <Navigate to="/admin" replace />;

  const getText = (es: string, en: string, gr: string) => {
    if (lang === 'en') return en;
    if (lang === 'gr') return gr;
    return es;
  };

  const MiniPreview = ({
    height = 28,
    showText = true,
    customText,
    backgroundColor,
    textColor
  }: {
    height?: number;
    showText?: boolean;
    customText?: string;
    backgroundColor?: string;
    textColor?: string;
  }) => {
    const previewText = customText || getText(formData.texto, formData.texto_en, formData.texto_gr);

    return (
      <div
        className="w-full overflow-hidden rounded-lg border border-green-900/30 shadow-lg"
        style={{
          backgroundColor: backgroundColor || formData.color,
          height: `${height}px`,
        }}
      >
        {showText && (
          <div
            className="whitespace-nowrap h-full flex items-center"
            style={{
              animation: `${formData.direccion === 'right' ? 'marquee-right' : 'marquee-left'} ${formData.velocidad}s linear infinite`,
              color: textColor || formData.colorTexto,
              fontSize: `${formData.tamanoTexto}px`,
              fontFamily: formData.tipoLetra,
              width: 'max-content',
              paddingLeft: '100%',
            }}
          >
            <span className="inline-block px-4">{previewText}</span>
            <span className="inline-block px-4">{previewText}</span>
            <span className="inline-block px-4">{previewText}</span>
            <span className="inline-block px-4">{previewText}</span>
          </div>
        )}
      </div>
    );
  };

  const ProSlider = ({
    label,
    value,
    onChange,
    min,
    max,
    step = 1,
    unit = 'px',
    icon: Icon,
    previewHeight
  }: {
    label: string;
    value: number;
    onChange: (val: number) => void;
    min: number;
    max: number;
    step?: number;
    unit?: string;
    icon?: any;
    previewHeight?: number;
  }) => (
    <div className="space-y-3 p-4 bg-black/30 rounded-xl border border-green-900/30">       
      <MiniPreview height={previewHeight || value} />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={14} className="text-green-500" />}
          <label className="text-sm text-gray-300">{label}</label>
        </div>
        <span className="text-sm font-mono text-white bg-black/50 px-3 py-1 rounded-full border border-green-900/30">
          {value}{unit}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(min, value - step))}
          className="w-8 h-8 bg-black/50 rounded-xl flex items-center justify-center hover:bg-green-500/10 transition-colors border border-green-900/30 text-green-500"
        >
          <Minus size={14} />
        </button>

        <div className="flex-1 relative">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"    
            style={{
              background: `linear-gradient(to right, #2ecc71 0%, #2ecc71 ${(value - min) / (max - min) * 100}%, #334155 ${(value - min) / (max - min) * 100}%, #334155 100%)`,
            }}
          />
        </div>

        <button
          onClick={() => onChange(Math.min(max, value + step))}
          className="w-8 h-8 bg-black/50 rounded-xl flex items-center justify-center hover:bg-green-500/10 transition-colors border border-green-900/30 text-green-500"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );

  const ColorPickerWithPreview = ({
    label,
    value,
    onChange,
    isOpen,
    setIsOpen,
    previewColor
  }: {
    label: string;
    value: string;
    onChange: (c: string) => void;
    isOpen: boolean;
    setIsOpen: (v: boolean) => void;
    previewColor?: string;
  }) => (
    <div className="space-y-3 p-4 bg-black/30 rounded-xl border border-green-900/30">       
      <MiniPreview
        height={28}
        backgroundColor={value}
        textColor={formData.colorTexto}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl border-2 border-green-900/30" style={{ backgroundColor: value }} />
          <span className="text-sm text-gray-300">{label}</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-xs text-gray-400 hover:text-green-500 transition-colors px-3 py-1.5 bg-black/50 rounded-xl border border-green-900/30"
        >
          {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          <span>{isOpen ? 'Cerrar' : 'Abrir paleta'}</span>
        </button>
      </div>

      {isOpen && (
        <div className="bg-black/50 rounded-xl p-4 border border-green-900/30">
          <div className="grid grid-cols-2 gap-4">
            {colorGamas.map((gama) => (
              <div key={gama.nombre} className="space-y-2">
                <h4 className="text-xs text-gray-400">{gama.nombre}</h4>
                <div className="flex gap-2 flex-wrap">
                  {gama.colores.map((color) => (
                    <button
                      key={color}
                      onClick={() => onChange(color)}
                      className={`w-8 h-8 rounded-lg transition-all hover:scale-110 hover:shadow-lg ${
                        value === color ? 'ring-2 ring-green-500 scale-110 shadow-lg' : ''  
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header con navegación */}
        <div className="mb-8">
          <AdminNavBack
            title={getText('Línea Informativa', 'Info Line', 'Γραμμή Πληροφοριών')}
            description={getText('Personaliza el mensaje animado', 'Customize animated message', 'Προσαρμογή μηνύματος')}
          />

          <div className="mt-4 flex flex-col sm:flex-row justify-end gap-3">
            {hasChanges && (
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-black/50 text-white rounded-xl hover:bg-green-500/10 transition-all flex items-center justify-center gap-2 text-sm sm:text-base border border-green-900/30"
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
                  ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30 border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.3)] animate-pulse'
                  : 'bg-black/50 text-gray-500 cursor-not-allowed border border-green-900/30'
              }`}
            >
              <Save size={20} />
              <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
              {hasChanges && !saving && (
                <span className="w-2 h-2 bg-green-500 rounded-full animate-ping ml-2" />    
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
            <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">{getText('Cargando...', 'Loading...', 'Φόρτωση...')}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* SECCIÓN 1: Textos */}
            <div className="bg-[#0a0a0a] rounded-2xl p-6 border border-green-900/30 hover:border-green-500/50 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:shadow-[0_0_25px_rgba(34,197,94,0.2)]">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-500/10 rounded-xl shadow-[0_0_10px_rgba(34,197,94,0.1)]">
                  <Globe size={18} className="text-green-500" />
                </div>
                <h2 className="font-display font-semibold text-white text-lg">
                  {getText('Textos en 3 idiomas', 'Texts in 3 languages', 'Κείμενα σε 3 γλώσσες')}
                </h2>
              </div>

              <div className="mb-6">
                <MiniPreview height={32} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Español */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-400 flex items-center gap-2">       
                      <span className="text-xl">🇪🇸</span> Español
                    </label>
                    <button
                      onClick={() => handleCopy(formData.texto, 'es')}
                      className="text-xs text-gray-500 hover:text-green-500 flex items-center gap-1 px-2 py-1 bg-black/50 rounded-lg border border-green-900/30"
                    >
                      {copied === 'es' ? <><Check size={12} /> Copiado</> : <><Copy size={12} /> Copiar</>}
                    </button>
                  </div>
                  <textarea
                    value={formData.texto}
                    onChange={(e) => setFormData({...formData, texto: e.target.value})}     
                    rows={2}
                    className="w-full bg-black/50 border border-green-900/30 rounded-xl px-4 py-3 text-white resize-none focus:border-green-500/50 transition-all"
                    placeholder="Texto en español..."
                  />
                  <button
                    onClick={() => handleTranslateFrom('es', formData.texto)}
                    disabled={!formData.texto}
                    className="w-full text-xs text-green-500 hover:text-green-400 flex items-center justify-center gap-1 py-2 border border-green-500/20 rounded-lg hover:bg-green-500/5"
                  >
                    <Globe size={12} /> Auto-traducir
                  </button>
                </div>

                {/* Inglés */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-400 flex items-center gap-2">       
                      <span className="text-xl">🇬🇧</span> English
                    </label>
                    <button
                      onClick={() => handleCopy(formData.texto_en, 'en')}
                      className="text-xs text-gray-500 hover:text-green-500 flex items-center gap-1 px-2 py-1 bg-black/50 rounded-lg border border-green-900/30"
                    >
                      {copied === 'en' ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
                    </button>
                  </div>
                  <textarea
                    value={formData.texto_en}
                    onChange={(e) => setFormData({...formData, texto_en: e.target.value})}  
                    rows={2}
                    className="w-full bg-black/50 border border-green-900/30 rounded-xl px-4 py-3 text-white resize-none focus:border-green-500/50 transition-all"
                    placeholder="English text..."
                  />
                  <button
                    onClick={() => handleTranslateFrom('en', formData.texto_en)}
                    disabled={!formData.texto_en}
                    className="w-full text-xs text-green-500 hover:text-green-400 flex items-center justify-center gap-1 py-2 border border-green-500/20 rounded-lg hover:bg-green-500/5"
                  >
                    <Globe size={12} /> Auto-translate
                  </button>
                </div>

                {/* Griego */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-400 flex items-center gap-2">       
                      <span className="text-xl">🇬🇷</span> Ελληνικά
                    </label>
                    <button
                      onClick={() => handleCopy(formData.texto_gr, 'gr')}
                      className="text-xs text-gray-500 hover:text-green-500 flex items-center gap-1 px-2 py-1 bg-black/50 rounded-lg border border-green-900/30"
                    >
                      {copied === 'gr' ? <><Check size={12} /> Αντιγράφηκε</> : <><Copy size={12} /> Αντιγραφή</>}
                    </button>
                  </div>
                  <textarea
                    value={formData.texto_gr}
                    onChange={(e) => setFormData({...formData, texto_gr: e.target.value})}  
                    rows={2}
                    className="w-full bg-black/50 border border-green-900/30 rounded-xl px-4 py-3 text-white resize-none focus:border-green-500/50 transition-all"
                    placeholder="Ελληνικό κείμενο..."
                  />
                  <button
                    onClick={() => handleTranslateFrom('gr', formData.texto_gr)}
                    disabled={!formData.texto_gr}
                    className="w-full text-xs text-green-500 hover:text-green-400 flex items-center justify-center gap-1 py-2 border border-green-500/20 rounded-lg hover:bg-green-500/5"
                  >
                    <Globe size={12} /> Αυτόματη μετάφραση
                  </button>
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: Grosor */}
            <div className="bg-[#0a0a0a] rounded-2xl p-6 border border-green-900/30 hover:border-green-500/50 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:shadow-[0_0_25px_rgba(34,197,94,0.2)]">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-500/10 rounded-xl">
                  <Move size={18} className="text-green-500" />
                </div>
                <h2 className="font-display font-semibold text-white text-lg">
                  {getText('Grosor de línea', 'Line thickness', 'Πάχος γραμμής')}
                </h2>
              </div>

              <ProSlider
                label={getText('Altura', 'Height', 'Ύψος')}
                value={formData.altoLinea}
                onChange={(val) => setFormData({...formData, altoLinea: val})}
                min={16}
                max={40}
                icon={Move}
                previewHeight={formData.altoLinea}
              />
            </div>

            {/* SECCIÓN 3: Tamaño texto */}
            <div className="bg-[#0a0a0a] rounded-2xl p-6 border border-green-900/30 hover:border-green-500/50 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:shadow-[0_0_25px_rgba(34,197,94,0.2)]">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-500/10 rounded-xl">
                  <Type size={18} className="text-green-500" />
                </div>
                <h2 className="font-display font-semibold text-white text-lg">
                  {getText('Tamaño de texto', 'Text size', 'Μέγεθος κειμένου')}
                </h2>
              </div>

              <ProSlider
                label={getText('Tamaño', 'Size', 'Μέγεθος')}
                value={formData.tamanoTexto}
                onChange={(val) => setFormData({...formData, tamanoTexto: val})}
                min={10}
                max={32}
                icon={Type}
                previewHeight={formData.altoLinea}
              />
            </div>

            {/* SECCIÓN 4: Colores */}
            <div className="bg-[#0a0a0a] rounded-2xl p-6 border border-green-900/30 hover:border-green-500/50 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:shadow-[0_0_25px_rgba(34,197,94,0.2)]">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-500/10 rounded-xl">
                  <Palette size={18} className="text-green-500" />
                </div>
                <h2 className="font-display font-semibold text-white text-lg">
                  {getText('Colores', 'Colors', 'Χρώματα')}
                </h2>
              </div>

              <div className="space-y-4">
                <ColorPickerWithPreview
                  label={getText('Color de fondo', 'Background color', 'Χρώμα φόντου')}
                  value={formData.color}
                  onChange={(c) => setFormData({...formData, color: c})}
                  isOpen={showFondoColors}
                  setIsOpen={setShowFondoColors}
                />

                <ColorPickerWithPreview
                  label={getText('Color del texto', 'Text color', 'Χρώμα κειμένου')}
                  value={formData.colorTexto}
                  onChange={(c) => setFormData({...formData, colorTexto: c})}
                  isOpen={showTextoColors}
                  setIsOpen={setShowTextoColors}
                />
              </div>
            </div>

            {/* SECCIÓN 5: Animación - CON VELOCIDAD CORREGIDA (135-300) */}
            <div className="bg-[#0a0a0a] rounded-2xl p-6 border border-green-900/30 hover:border-green-500/50 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:shadow-[0_0_25px_rgba(34,197,94,0.2)]">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-500/10 rounded-xl">
                  <Play size={18} className="text-green-500" />
                </div>
                <h2 className="font-display font-semibold text-white text-lg">
                  {getText('Animación', 'Animation', 'Κίνηση')}
                </h2>
              </div>

              <div className="mb-6">
                <MiniPreview height={formData.altoLinea} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Velocidad (seg)</label>
                  <input
                    type="range"
                    min="135"      // 👈 CAMBIADO de 20 a 135
                    max="300"      // 👈 CAMBIADO de 200 a 300
                    step="5"
                    value={formData.velocidad}
                    onChange={(e) => setFormData({...formData, velocidad: parseInt(e.target.value)})}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Lento (135s)</span>
                    <span className="text-white font-mono">{formData.velocidad}s</span>
                    <span>Muy lento (300s)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Dirección</label>    
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="direccion"
                        checked={formData.direccion === 'left'}
                        onChange={() => setFormData({...formData, direccion: 'left'})}      
                        className="accent-green-500"
                      />
                      <span className="text-white text-sm">Izquierda →</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="direccion"
                        checked={formData.direccion === 'right'}
                        onChange={() => setFormData({...formData, direccion: 'right'})}     
                        className="accent-green-500"
                      />
                      <span className="text-white text-sm">← Derecha</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm text-gray-400 mb-2">Posición</label>       
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="posicion"
                      checked={formData.posicion === 'top'}
                      onChange={() => setFormData({...formData, posicion: 'top'})}
                      className="accent-green-500"
                    />
                    <span className="text-white flex items-center gap-1">
                      <ArrowUp size={14} className="text-green-500" />
                      Superior
                    </span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="posicion"
                      checked={formData.posicion === 'bottom'}
                      onChange={() => setFormData({...formData, posicion: 'bottom'})}       
                      className="accent-green-500"
                    />
                    <span className="text-white flex items-center gap-1">
                      <ArrowDown size={14} className="text-yellow-500" />
                      Inferior
                    </span>
                  </label>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm text-gray-400 mb-2">Enlace</label>
                <input
                  type="url"
                  value={formData.link || ''}
                  onChange={(e) => setFormData({...formData, link: e.target.value})}        
                  className="w-full bg-black/50 border border-green-900/30 rounded-xl px-4 py-3 text-white focus:border-green-500/50 transition-all"
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* Estado */}
            <div className="bg-[#0a0a0a] rounded-2xl p-6 border border-green-900/30 hover:border-green-500/50 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:shadow-[0_0_25px_rgba(34,197,94,0.2)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-500/10 rounded-xl">
                  <Activity size={18} className="text-green-500" />
                </div>
                <h2 className="font-display font-semibold text-white">
                  {getText('Estado', 'Status', 'Κατάσταση')}
                </h2>
              </div>
              <label className="flex items-center gap-3 cursor-pointer p-4 bg-black/50 rounded-xl border border-green-900/30">
                <input
                  type="checkbox"
                  checked={formData.activo}
                  onChange={(e) => setFormData({...formData, activo: e.target.checked})}    
                  className="accent-green-500 w-5 h-5"
                />
                <span className="text-white">
                  {getText('Activar línea informativa', 'Enable info line', 'Ενεργοποίηση γραμμής')}
                </span>
              </label>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes marquee-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-400%); }
        }
        @keyframes marquee-right {
          0% { transform: translateX(-400%); }
          100% { transform: translateX(0); }
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #2ecc71;
          cursor: pointer;
          box-shadow: 0 0 10px #2ecc71;
          border: 2px solid white;
        }
      `}</style>
    </div>
  );
};

export default AdminInfoLine;