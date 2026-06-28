"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { sendMessage } from "@/services/chatbotService";

interface Message {
  role: "user" | "assistant";
  content: string;
}

// ============================================================
// 🔥 FUNCIONES DE IDIOMA
// ============================================================
const getGreeting = (language: string): string => {
  const hour = new Date().getHours();
  const isMorning = hour >= 5 && hour < 12;
  const isAfternoon = hour >= 12 && hour < 19;
  const greetings: Record<string, { morning: string; afternoon: string; night: string }> = {
    es: { morning: "Buenos días", afternoon: "Buenas tardes", night: "Buenas noches" },
    en: { morning: "Good morning", afternoon: "Good afternoon", night: "Good evening" },
    gr: { morning: "Καλημέρα", afternoon: "Καλησπέρα", night: "Καληνύχτα" }
  };
  const lang = greetings[language] || greetings.es;
  if (isMorning) return lang.morning;
  if (isAfternoon) return lang.afternoon;
  return lang.night;
};

const getHelpText = (language: string): string => {
  const texts: Record<string, string> = {
    es: "¿Necesitas ayuda? ¡Pregúntame!",
    en: "Need help? Ask me!",
    gr: "Χρειάζεσαι βοήθεια; Ρώτα με!"
  };
  return texts[language] || texts.es;
};

const getWelcomeMessage = (language: string, greeting: string): string => {
  const messages: Record<string, string> = {
    es: `${greeting}! 🐶 Soy Scooter, el asistente de Electric Scooter House. ¿En qué puedo ayudarte?`,
    en: `${greeting}! 🐶 I'm Scooter, the Electric Scooter House assistant. How can I help you?`,
    gr: `${greeting}! 🐶 Είμαι ο Scooter, ο βοηθός του Electric Scooter House. Πώς μπορώ να σε βοηθήσω;`
  };
  return messages[language] || messages.es;
};

const getTypingText = (language: string): string => {
  const texts: Record<string, string> = {
    es: "Escribiendo",
    en: "Typing",
    gr: "Πληκτρολογεί"
  };
  return texts[language] || texts.es;
};

const getPlaceholder = (language: string): string => {
  const texts: Record<string, string> = {
    es: "Escribe...",
    en: "Type...",
    gr: "Γράψε..."
  };
  return texts[language] || texts.es;
};

export default function Chatbot() {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [isTyping, setIsTyping] = useState(true);
  const [bubblePhase, setBubblePhase] = useState<"greeting" | "help">("greeting");
  const [tongueOut, setTongueOut] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsTyping(true);
    setShowBubble(true);
    setBubblePhase("greeting");
    const t1 = setTimeout(() => setIsTyping(false), 1500);
    const t2 = setTimeout(() => {
      setShowBubble(false);
      setTimeout(() => {
        setBubblePhase("help");
        setIsTyping(true);
        setShowBubble(true);
        setTimeout(() => setIsTyping(false), 1500);
      }, 500);
    }, 10000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [language]);

  useEffect(() => {
    const greeting = getGreeting(language);
    setMessages([{ role: "assistant", content: getWelcomeMessage(language, greeting) }]);
  }, [language]);

  useEffect(() => {
    const tongueInterval = setInterval(() => { 
      setTongueOut(true); 
      setTimeout(() => setTongueOut(false), 800); 
    }, 4500);
    return () => clearInterval(tongueInterval);
  }, []);

  useEffect(() => { 
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); 
  }, [messages]);
  
  useEffect(() => { 
    if (isOpen && inputRef.current) inputRef.current.focus(); 
  }, [isOpen]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && chatRef.current && !chatRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const sendMessageHandler = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);
    try {
      const reply = await sendMessage(
        [...messages, { role: "user", content: userMessage }],
        language
      );
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (error) {
      const errors: Record<string, string> = {
        es: "❌ Error. Contáctanos por WhatsApp o Viber al +30 699 318 5757",
        en: "❌ Error. Contact us on WhatsApp or Viber at +30 699 318 5757",
        gr: "❌ Σφάλμα. Επικοινωνήστε μαζί μας στο WhatsApp ή Viber στο +30 699 318 5757"
      };
      setMessages(prev => [...prev, { role: "assistant", content: errors[language] || errors.es }]);
    } finally { 
      setIsLoading(false); 
    }
  };

  return (
    <>
      {!isOpen && (
        <motion.button
          onClick={() => { setIsOpen(true); setShowBubble(false); }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="fixed right-3 z-[99999] bg-transparent border-0 cursor-pointer p-0 outline-none focus:outline-none
                     bottom-[calc(76px+env(safe-area-inset-bottom,0px))] 
                     sm:bottom-5"
          aria-label="Abrir chat"
        >
          <div className="relative flex items-end gap-2 flex-row-reverse">
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-8 h-8 sm:w-10 sm:h-10"
            >
              <div className="absolute -top-2.5 left-1 w-2 h-3.5 bg-zinc-400 rounded-t-full" />
              <div className="absolute -top-2.5 right-1 w-2 h-3.5 bg-zinc-400 rounded-t-full" />
              <div className="relative w-full h-full bg-gradient-to-br from-zinc-300 via-zinc-400 to-zinc-500 rounded-2xl shadow-md">
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
                <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 w-3.5 h-2 bg-zinc-200/60 rounded-full" />
                <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 w-1.5 h-1 bg-zinc-800 rounded-full" />
                {tongueOut && (
                  <motion.div 
                    initial={{ y: 3, opacity: 0 }} 
                    animate={{ y: 0, opacity: 1 }} 
                    exit={{ y: 3, opacity: 0 }} 
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-2.5 bg-pink-400 rounded-full" 
                  />
                )}
                <div className="absolute top-1 left-1.5 w-2 h-1 bg-white/30 rounded-full" />
              </div>
              <motion.div
                animate={{ rotate: [15, -15, 15] }}
                transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -right-1.5 top-2 w-2.5 h-1.5 bg-zinc-400 rounded-full origin-left"
              />
              <div className="absolute -bottom-0.5 left-1.5 flex gap-0.5">
                <div className="w-1 h-1.5 bg-zinc-400 rounded-full" />
                <div className="w-1 h-1.5 bg-zinc-400 rounded-full" />
              </div>
              <div className="absolute -bottom-0.5 right-1.5 flex gap-0.5">
                <div className="w-1 h-1.5 bg-zinc-400 rounded-full" />
                <div className="w-1 h-1.5 bg-zinc-400 rounded-full" />
              </div>
            </motion.div>
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
                  ) : bubblePhase === "greeting" ? (
                    `${getGreeting(language)}! 🐶`
                  ) : (
                    getHelpText(language) + " 🐶"
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.button>
      )}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={chatRef}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed right-3 z-[99999] w-[90vw] sm:w-[350px] h-[440px] max-w-[350px] rounded-2xl shadow-2xl bg-gradient-to-br from-zinc-900 to-black flex flex-col overflow-hidden border border-zinc-700/30
                       bottom-[calc(76px+env(safe-area-inset-bottom,0px))] 
                       sm:bottom-4"
          >
            <div className="bg-gradient-to-r from-zinc-600 to-zinc-500 py-3 px-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-base">🐶</span>
                <div>
                  <h3 className="font-bold text-white text-xs">Scooter</h3>
                  <span className="text-[9px] text-white/50">
                    ● {language === "es" ? "En línea" : language === "en" ? "Online" : "Συνδεδεμένο"}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-white hover:bg-white/20 rounded-lg w-6 h-6 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] p-2 px-3 rounded-2xl text-[11px] ${
                    msg.role === "user" 
                      ? "bg-zinc-600 text-white rounded-br-md" 
                      : "bg-zinc-800 text-zinc-100 rounded-bl-md"
                  }`}>
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-zinc-800 p-2.5 rounded-2xl rounded-bl-md flex gap-1">
                    <span className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce" />
                    <span className="w-1 h-1 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '100ms' }} />
                    <span className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-2.5 border-t border-zinc-800 bg-black/30">
              <div className="flex gap-1.5">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessageHandler()}
                  placeholder={getPlaceholder(language)}
                  className="flex-1 bg-zinc-800 text-white rounded-xl px-3 py-2 text-[11px] focus:outline-none focus:ring-2 focus:ring-zinc-500/50"
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessageHandler}
                  disabled={isLoading || !input.trim()}
                  className="bg-zinc-600 text-white px-2.5 py-2 rounded-xl disabled:opacity-50 text-xs"
                >
                  📤
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}