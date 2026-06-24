import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Minimize2, Maximize2 } from 'lucide-react';
import { useChatbot } from '@/contexts/ChatbotContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatbotWindowProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  onClose: () => void;
  isLoading: boolean;
  position?: 'bottom-right' | 'bottom-left';
  theme?: 'light' | 'dark' | 'auto';
  language?: string;
}

export default function ChatbotWindow({
  messages,
  onSendMessage,
  onClose,
  isLoading,
  position = 'bottom-right',
  theme = 'auto',
  language = 'es',
}: ChatbotWindowProps) {
  const [input, setInput] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { resetUnread } = useChatbot();

  const positionClasses = {
    'bottom-right': 'bottom-16 right-2 sm:bottom-20 sm:right-4',
    'bottom-left': 'bottom-16 left-2 sm:bottom-20 sm:left-4',
  };

  const isDark = theme === 'dark' || 
    (theme === 'auto' && document.documentElement.classList.contains('dark'));

  // ============================================================
  // 📱 DETECTAR MÓVIL Y TECLADO
  // ============================================================
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Detectar cuando el teclado está abierto en móvil
    const handleResize = () => {
      if (isMobile) {
        const isKeyboardOpen = window.innerHeight < window.screen.height * 0.8;
        setKeyboardVisible(isKeyboardOpen);
      }
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('resize', handleResize);
    };
  }, [isMobile]);

  // ============================================================
  // SCROLL Y ENFOQUE
  // ============================================================
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    resetUnread();
  }, []);

  useEffect(() => {
    if (!isMinimized && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isMinimized]);

  // ============================================================
  // ENVIAR MENSAJE
  // ============================================================
  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getPlaceholder = () => {
    const placeholders: Record<string, string> = {
      es: 'Escribe...',
      en: 'Type...',
      gr: 'Γράψτε...',
    };
    return placeholders[language] || placeholders.es;
  };

  // ============================================================
  // 📱 TAMAÑOS RESPONSIVE
  // ============================================================
  const windowHeight = isMobile ? (keyboardVisible ? 320 : 380) : 520;
  const windowWidth = isMobile ? 290 : 400;
  const headerHeight = isMobile ? 40 : 52;
  const inputHeight = isMobile ? 44 : 56;
  const chatHeight = windowHeight - headerHeight - inputHeight;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        scale: 1,
        height: isMinimized ? 'auto' : windowHeight,
        width: isMinimized ? 'auto' : windowWidth,
      }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className={`
        fixed ${positionClasses[position]} z-50
        w-[85vw] max-w-[400px]
        rounded-xl sm:rounded-2xl
        shadow-2xl
        overflow-hidden
        ${isDark 
          ? 'bg-gray-900 border border-gray-700' 
          : 'bg-white border border-gray-200'
        }
        transition-all duration-300
      `}
    >
      {/* ===== HEADER ===== */}
      <div className={`
        px-2.5 py-2 flex justify-between items-center
        ${isDark 
          ? 'bg-gradient-to-r from-blue-600 to-purple-600' 
          : 'bg-gradient-to-r from-blue-500 to-purple-500'
        }
        min-h-[40px] sm:min-h-[52px]
      `}>
        <div className="flex items-center gap-1.5 text-white min-w-0">
          <span className={`${isMobile ? 'text-base' : 'text-xl'} flex-shrink-0`}>🐶</span>
          <div className="truncate">
            <h3 className={`font-bold ${isMobile ? 'text-[10px]' : 'text-sm'} truncate`}>
              {isMobile ? 'ESH' : 'Electric Scooter House'}
            </h3>
            <span className={`${isMobile ? 'text-[6px]' : 'text-[10px]'} opacity-80`}>
              ● Online
            </span>
          </div>
        </div>
        <div className="flex gap-0.5 flex-shrink-0">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-white hover:bg-white/20 rounded-lg p-1 transition"
          >
            {isMinimized ? <Maximize2 size={isMobile ? 12 : 18} /> : <Minimize2 size={isMobile ? 12 : 18} />}
          </button>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-1 transition"
          >
            <X size={isMobile ? 12 : 18} />
          </button>
        </div>
      </div>

      {/* ===== CHAT ===== */}
      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col"
            style={{ height: chatHeight }}
          >
            {/* Mensajes */}
            <div className={`
              flex-1 overflow-y-auto p-2 space-y-1.5
              ${isDark ? 'bg-gray-800' : 'bg-gray-50'}
            `}>
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`
                      max-w-[90%] px-2 py-1 rounded-xl
                      ${msg.role === 'user'
                        ? `${isDark ? 'bg-blue-600' : 'bg-blue-500'} text-white rounded-br-none`
                        : `${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'} rounded-bl-none shadow-sm`
                      }
                    `}
                  >
                    <p className={`whitespace-pre-wrap break-words ${isMobile ? 'text-[11px]' : 'text-[13px]'} leading-relaxed`}>
                      {msg.content}
                    </p>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className={`
                    p-1.5 rounded-xl rounded-bl-none shadow-sm flex gap-0.5
                    ${isDark ? 'bg-gray-700' : 'bg-white'}
                  `}>
                    <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" />
                    <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* ===== INPUT ===== */}
            <div className={`
              p-1.5 border-t
              ${isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'}
            `}>
              <div className="flex gap-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={getPlaceholder()}
                  disabled={isLoading}
                  className={`
                    flex-1 rounded-lg px-2.5 py-1
                    focus:outline-none focus:ring-1 focus:ring-blue-500
                    ${isDark 
                      ? 'bg-gray-700 text-white placeholder-gray-400' 
                      : 'bg-gray-100 text-gray-800 placeholder-gray-500'
                    }
                    ${isMobile ? 'text-[11px] py-1 px-2' : 'text-sm py-2 px-3.5'}
                  `}
                />
                
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className={`
                    rounded-lg transition disabled:opacity-50
                    ${isDark 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }
                    ${isMobile ? 'px-2.5 py-1' : 'px-4 py-2'}
                  `}
                >
                  <Send size={isMobile ? 12 : 18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}