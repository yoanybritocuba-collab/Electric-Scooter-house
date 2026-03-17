import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getInfoLine, InfoLineData } from '@/services/infoLineService';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const InfoLine = () => {
  const { lang } = useLanguage();
  const [info, setInfo] = useState<InfoLineData | null>(null);
  const [visible, setVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const marqueeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadInfo();
  }, []);

  useEffect(() => {
    if (info?.activo && visible) {
      document.documentElement.style.setProperty('--infoline-height', `${info.altoLinea}px`);
    } else {
      document.documentElement.style.setProperty('--infoline-height', '0px');
    }
    
    return () => {
      document.documentElement.style.setProperty('--infoline-height', '0px');
    };
  }, [info?.activo, visible, info?.altoLinea]);

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

  const textContent = getTexto();
  const direction = info.direccion === 'right' ? 'marquee-right' : 'marquee-left';

  const getPosition = () => {
    if (info.posicion === 'top') {
      return { top: '80px' };
    } else {
      return { bottom: '56px' };
    }
  };

  const lineStyle = {
    backgroundColor: info.color,
    color: info.colorTexto,
    height: `${info.altoLinea}px`,
    fontSize: `${info.tamanoTexto}px`,
    fontFamily: info.tipoLetra,
    position: 'fixed' as const,
    left: 0,
    right: 0,
    zIndex: 45,
    ...getPosition(),
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{
          y: info.posicion === 'top' ? -50 : 50,
          opacity: 0
        }}
        animate={{ y: 0, opacity: 1 }}
        exit={{
          y: info.posicion === 'top' ? -50 : 50,
          opacity: 0
        }}
        style={lineStyle}
        className="overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="relative w-full h-full flex items-center">
          <div
            ref={marqueeRef}
            className="whitespace-nowrap absolute"
            style={{
              animation: `${direction} ${info.velocidad}s linear infinite`,
              animationPlayState: isPaused ? 'paused' : 'running',
              paddingLeft: '100%',
              display: 'flex',
              alignItems: 'center',
              height: '100%',
              width: 'max-content',
            }}
          >
            <span className="inline-block px-4">{textContent}</span>
            <span className="inline-block px-4">{textContent}</span>
            <span className="inline-block px-4">{textContent}</span>
            <span className="inline-block px-4">{textContent}</span>
          </div>

          <button
            onClick={() => setVisible(false)}
            className="absolute right-4 z-10 text-white/80 hover:text-white transition-colors"
            style={{ color: info.colorTexto }}
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>

          {info.link && (
            <a
              href={info.link}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute left-4 z-10 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full text-xs transition-colors"
              style={{ color: info.colorTexto }}
            >
              {lang === 'es' ? 'Saber más' : lang === 'en' ? 'Learn more' : 'Μάθετε περισσότερα'}
            </a>
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
        `}</style>
      </motion.div>
    </AnimatePresence>
  );
};

export default InfoLine;