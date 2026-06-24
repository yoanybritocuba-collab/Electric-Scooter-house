import { motion, AnimatePresence } from 'framer-motion';
import { useChatbot } from '@/contexts/ChatbotContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect } from 'react';

interface ChatbotButtonProps {
  onClick: () => void;
  position?: 'bottom-right' | 'bottom-left';
  theme?: 'light' | 'dark' | 'auto';
}

const getGreeting = (language: string): string => {
  const hour = new Date().getHours();
  const isMorning = hour >= 5 && hour < 12;
  const isAfternoon = hour >= 12 && hour < 19;
  const greetings: Record<string, { morning: string; afternoon: string; night: string }> = {
    es: { morning: 'Buenos días', afternoon: 'Buenas tardes', night: 'Buenas noches' },
    en: { morning: 'Good morning', afternoon: 'Good afternoon', night: 'Good evening' },
    gr: { morning: 'Καλημέρα', afternoon: 'Καλησπέρα', night: 'Καληνύχτα' },
  };
  const lang = greetings[language] || greetings.es;
  if (isMorning) return lang.morning;
  if (isAfternoon) return lang.afternoon;
  return lang.night;
};

const getHelpText = (language: string): string => {
  const texts: Record<string, string> = {
    es: '¿Necesitas ayuda? ¡Pregúntame!',
    en: 'Need help? Ask me!',
    gr: 'Χρειάζεστε βοήθεια; Ρωτήστε με!',
  };
  return texts[language] || texts.es;
};

const getTypingText = (language: string): string => {
  const texts: Record<string, string> = {
    es: 'Escribiendo',
    en: 'Typing',
    gr: 'Πληκτρολόγηση',
  };
  return texts[language] || texts.es;
};

export default function ChatbotButton({ 
  onClick, 
  position = 'bottom-right',
  theme = 'auto'
}: ChatbotButtonProps) {
  const { unreadCount } = useChatbot();
  const { language } = useLanguage();
  const [showBubble, setShowBubble] = useState(false);
  const [isTyping, setIsTyping] = useState(true);
  const [bubblePhase, setBubblePhase] = useState<'greeting' | 'help'>('greeting');
  const [tongueOut, setTongueOut] = useState(false);

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  };

  useEffect(() => {
    setIsTyping(true);
    setShowBubble(true);
    setBubblePhase('greeting');
    const t1 = setTimeout(() => setIsTyping(false), 1500);
    const t2 = setTimeout(() => {
      setShowBubble(false);
      setTimeout(() => {
        setBubblePhase('help');
        setIsTyping(true);
        setShowBubble(true);
        setTimeout(() => setIsTyping(false), 1500);
      }, 500);
    }, 10000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [language]);

  useEffect(() => {
    const tongueInterval = setInterval(() => { 
      setTongueOut(true); 
      setTimeout(() => setTongueOut(false), 800); 
    }, 4500);
    return () => clearInterval(tongueInterval);
  }, []);

  return (
    <motion.button
      onClick={() => { onClick(); setShowBubble(false); }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className={`fixed ${positionClasses[position]} z-[99999] bg-transparent border-0 cursor-pointer p-0 outline-none focus:outline-none`}
      aria-label="Abrir chat"
    >
      <div className="relative flex items-end gap-2 flex-row-reverse">
        
        {/* 🔥 PERRITO ORIGINAL */}
        <motion.div
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="relative w-8 h-8 sm:w-10 sm:h-10"
        >
          {/* Orejas */}
          <div className="absolute -top-2.5 left-1 w-2 h-3.5 bg-zinc-400 rounded-t-full" />
          <div className="absolute -top-2.5 right-1 w-2 h-3.5 bg-zinc-400 rounded-t-full" />
          
          {/* Cuerpo */}
          <div className="relative w-full h-full bg-gradient-to-br from-zinc-300 via-zinc-400 to-zinc-500 rounded-2xl shadow-md">
            {/* Ojos */}
            <div className="absolute top-2.5 left-0 right-0 flex justify-center gap-2.5">
              <div className="w-2 h-2.5 bg-white rounded-full">
                <div className="w-1.5 h-2 bg-zinc-800 rounded-full mt-0.5 ml-0.5">
                  <div className="w-0.5 h-0.5 bg-white rounded-full mt-0.5 ml-0.5" />
                </div>
              </div>
              <div className="w-2 h-2.5 bg-white rounded-full">
                <div className="w-1.5 h-2 bg-zinc-800 rounded-full mt-0.5 ml-0.5">
                  <div className="w-0.5 h-0.5 bg-white rounded-full mt-0.5 ml-0.5" />
                </div>
              </div>
            </div>
            
            {/* Hocico */}
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 w-3.5 h-2 bg-zinc-200/60 rounded-full" />
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 w-1.5 h-1 bg-zinc-800 rounded-full" />
            
            {/* Lengua */}
            {tongueOut && (
              <motion.div
                initial={{ y: 3, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 3, opacity: 0 }}
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-2.5 bg-pink-400 rounded-full"
              />
            )}
            
            {/* Brillo */}
            <div className="absolute top-1 left-1.5 w-2 h-1 bg-white/30 rounded-full" />
          </div>
          
          {/* Cola */}
          <motion.div
            animate={{ rotate: [15, -15, 15] }}
            transition={{ duration: 0.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -right-1.5 top-2 w-2.5 h-1.5 bg-zinc-400 rounded-full origin-left"
          />
          
          {/* Patas */}
          <div className="absolute -bottom-0.5 left-1.5 flex gap-0.5">
            <div className="w-1 h-1.5 bg-zinc-400 rounded-full" />
            <div className="w-1 h-1.5 bg-zinc-400 rounded-full" />
          </div>
          <div className="absolute -bottom-0.5 right-1.5 flex gap-0.5">
            <div className="w-1 h-1.5 bg-zinc-400 rounded-full" />
            <div className="w-1 h-1.5 bg-zinc-400 rounded-full" />
          </div>
        </motion.div>

        {/* Burbuja */}
        <AnimatePresence>
          {showBubble && (
            <motion.div
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -5 }}
              className="bg-white text-zinc-700 px-2.5 py-1.5 rounded-2xl text-[10px] sm:text-[11px] font-medium shadow-md whitespace-nowrap"
            >
              {isTyping ? (
                <span className="flex items-center gap-1">
                  {getTypingText(language)}
                  <span className="flex gap-0.5">
                    <span className="w-0.5 h-0.5 bg-zinc-400 rounded-full animate-bounce" />
                    <span className="w-0.5 h-0.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '100ms' }} />
                    <span className="w-0.5 h-0.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                  </span>
                </span>
              ) : bubblePhase === 'greeting' ? (
                `¡${getGreeting(language)}! 🐶`
              ) : (
                getHelpText(language) + ' 🐶'
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notificaciones */}
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </div>
    </motion.button>
  );
}