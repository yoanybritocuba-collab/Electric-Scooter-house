import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getInfoLine, InfoLineData } from '@/services/infoLineService';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const InfoLine = () => {
  const { lang } = useLanguage();
  const [info, setInfo] = useState<InfoLineData | null>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    loadInfo();
  }, []);

  const loadInfo = async () => {
    const data = await getInfoLine();
    setInfo(data);
  };

  const getTexto = (): string => {
    if (!info) return '';
    if (lang === 'en' && info.texto_en) return info.texto_en;
    if (lang === 'gr' && info.texto_gr) return info.texto_gr;
    return info.texto;
  };

  if (!info?.activo || !visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        className="relative w-full py-2 px-4 text-center z-40"
        style={{ backgroundColor: info.color || '#2ecc71' }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-4">
          <span className="text-white font-medium text-xs sm:text-sm md:text-base">
            {getTexto()}
          </span>
          {info.link && (
            <a
              href={info.link}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/20 hover:bg-white/30 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs transition-colors"
            >
              Saber más
            </a>
          )}
          <button
            onClick={() => setVisible(false)}
            className="absolute right-2 sm:right-4 text-white/80 hover:text-white transition-colors"
            aria-label="Cerrar"
          >
            <X size={14} className="sm:w-4 sm:h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default InfoLine;