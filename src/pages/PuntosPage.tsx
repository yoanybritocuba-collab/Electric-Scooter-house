import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePuntos } from '@/hooks/usePuntos';
import { motion } from 'framer-motion';
import { Gift, History, TrendingUp, Award } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const PuntosPage = () => {
  const { user } = useAuth();
  const { puntos, historial, config, loading, canjear, puntosEnEuros } = usePuntos();
  const [canjeando, setCanjeando] = useState(false);
  const [puntosACanjear, setPuntosACanjear] = useState(100);

  const handleCanjear = async () => {
    if (!user) return;
    
    setCanjeando(true);
    const resultado = await canjear(puntosACanjear);
    
    if (resultado.exito) {
      toast({
        title: "¡Canje exitoso!",
        description: `Has obtenido ${resultado.descuento.toFixed(2)}€ de descuento`,
      });
    } else {
      toast({
        title: "Error",
        description: resultado.error || "No se pudo canjear",
        variant: "destructive",
      });
    }
    setCanjeando(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <p className="text-gray-400">Inicia sesión para ver tus puntos</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 lg:px-8">
        <h1 className="font-display font-bold text-3xl md:text-4xl text-white mb-8">
          Mis Puntos de Fidelización
        </h1>

        {/* Tarjeta de puntos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-primary to-green-600 rounded-2xl p-6 mb-8"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Award size={32} className="text-white" />
            </div>
            <div>
              <p className="text-white/80 text-sm">Tus puntos</p>
              <p className="text-white text-4xl font-bold">{puntos}</p>
              <p className="text-white/80 text-sm mt-1">≈ {puntosEnEuros}€ en descuentos</p>
            </div>
          </div>
        </motion.div>

        {/* Canje de puntos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900 rounded-xl p-6 mb-8"
        >
          <h2 className="font-display font-bold text-xl text-white mb-4 flex items-center gap-2">
            <Gift size={20} className="text-primary" />
            Canjear Puntos
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Puntos a canjear
              </label>
              <input
                type="number"
                min="100"
                max={puntos}
                step="100"
                value={puntosACanjear}
                onChange={(e) => setPuntosACanjear(parseInt(e.target.value) || 0)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:border-primary transition-colors"
              />
              {config && (
                <p className="text-sm text-gray-500 mt-2">
                  Obtendrás {(puntosACanjear * config.valorPunto).toFixed(2)}€ de descuento
                </p>
              )}
            </div>

            <button
              onClick={handleCanjear}
              disabled={canjeando || puntosACanjear < 100 || puntosACanjear > puntos}
              className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-glow transition-colors disabled:opacity-50"
            >
              {canjeando ? "Procesando..." : "Canjear puntos"}
            </button>
          </div>
        </motion.div>

        {/* Historial de puntos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900 rounded-xl p-6"
        >
          <h2 className="font-display font-bold text-xl text-white mb-4 flex items-center gap-2">
            <History size={20} className="text-primary" />
            Historial de Puntos
          </h2>

          {loading ? (
            <p className="text-gray-400 text-center py-8">Cargando...</p>
          ) : historial.length === 0 ? (
            <p className="text-gray-400 text-center py-8">
              No tienes movimientos de puntos aún
            </p>
          ) : (
            <div className="space-y-3">
              {historial.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
                >
                  <div>
                    <p className="text-white font-medium">{item.concepto}</p>
                    <p className="text-sm text-gray-500">
                      {item.fecha?.toDate?.().toLocaleDateString() || new Date().toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`font-bold ${item.tipo === 'ganado' ? 'text-green-500' : 'text-red-500'}`}>
                    {item.tipo === 'ganado' ? '+' : '-'}{item.cantidad}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default PuntosPage; // 👈 LÍNEA IMPORTANTE