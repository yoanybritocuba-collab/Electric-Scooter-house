import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Navigate, useNavigate } from "react-router-dom";
import { getHorarioOrDefault, saveHorario, HorarioData } from "@/services/horarioService";
import { Save, Clock, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";

const AdminHorario = () => {
  const { user, isAdmin } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [horario, setHorario] = useState<HorarioData>({
    lunesViernes: "",
    sabado: "",
    domingo: "",
    ultimaActualizacion: ""
  });

  useEffect(() => {
    loadHorario();
  }, []);

  const loadHorario = async () => {
    setLoading(true);
    try {
      const data = await getHorarioOrDefault();
      setHorario(data);
    } catch (err) {
      console.error("Error cargando horario:", err);
      setError("Error al cargar el horario");
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    
    try {
      const success = await saveHorario(horario);
      if (success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError("Error al guardar el horario");
      }
    } catch (err) {
      console.error("Error guardando:", err);
      setError("Error al guardar el horario");
    }
    setSaving(false);
  };

  const handleChange = (field: keyof HorarioData, value: string) => {
    setHorario(prev => ({ ...prev, [field]: value }));
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (!user || !isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Cargando horario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-3xl mx-auto">
        {/* Botón Volver */}
        <button
          onClick={handleGoBack}
          className="flex items-center gap-2 text-gray-400 hover:text-[#2ecc71] transition-colors group mb-6"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-normal">Volver al Dashboard</span>
        </button>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Clock className="text-purple-500" size={28} />
              Editar Horario
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Gestiona el horario que se muestra en el footer de la web
            </p>
          </div>
          
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${
              saving
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-purple-500 text-black hover:bg-purple-400'
            }`}
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save size={18} />
                Guardar horario
              </>
            )}
          </button>
        </div>

        {/* Mensajes */}
        {success && (
          <div className="mb-6 bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle size={20} />
            <span>✅ Horario guardado correctamente</span>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Formulario */}
        <div className="bg-[#0a0a0a] border border-purple-900/30 rounded-xl p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              Lunes a Viernes
            </label>
            <input
              type="text"
              value={horario.lunesViernes}
              onChange={(e) => handleChange('lunesViernes', e.target.value)}
              placeholder="Ej: 10:00 - 14:00 | 16:00 - 20:00"
              className="w-full bg-black/50 border border-purple-900/30 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none transition-all"
            />
            <p className="text-xs text-gray-500">Formato: 10:00 - 14:00 | 16:00 - 20:00</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              Sábados
            </label>
            <input
              type="text"
              value={horario.sabado}
              onChange={(e) => handleChange('sabado', e.target.value)}
              placeholder="Ej: 10:00 - 14:00"
              className="w-full bg-black/50 border border-purple-900/30 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none transition-all"
            />
            <p className="text-xs text-gray-500">Formato: 10:00 - 14:00</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              Domingos
            </label>
            <input
              type="text"
              value={horario.domingo}
              onChange={(e) => handleChange('domingo', e.target.value)}
              placeholder="Ej: Cerrado"
              className="w-full bg-black/50 border border-purple-900/30 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none transition-all"
            />
            <p className="text-xs text-gray-500">Ej: Cerrado, 10:00 - 14:00</p>
          </div>

          {horario.ultimaActualizacion && (
            <div className="pt-4 border-t border-purple-900/30">
              <p className="text-xs text-gray-500">
                Última actualización: {new Date(horario.ultimaActualizacion).toLocaleString()}
              </p>
            </div>
          )}

          {/* Vista previa */}
          <div className="pt-4 border-t border-purple-900/30">
            <p className="text-xs text-gray-400 mb-3 font-medium">📋 Vista previa en el footer:</p>
            <div className="bg-black/30 rounded-lg p-4 space-y-1 text-sm">
              <p className="text-gray-300">Lunes a Viernes: <span className="text-white">{horario.lunesViernes || "No definido"}</span></p>
              <p className="text-gray-300">Sábados: <span className="text-white">{horario.sabado || "No definido"}</span></p>
              <p className="text-gray-300">Domingos: <span className="text-white">{horario.domingo || "No definido"}</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHorario;