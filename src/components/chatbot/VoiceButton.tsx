import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { motion } from 'framer-motion';

interface VoiceButtonProps {
  onTranscript: (text: string) => void;
  language?: string;
  isDisabled?: boolean;
}

export default function VoiceButton({ 
  onTranscript, 
  language = 'es',
  isDisabled = false 
}: VoiceButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [recordingTime, setRecordingTime] = useState(0);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Inicializar reconocimiento de voz
  useEffect(() => {
    // Verificar soporte
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      console.warn('⚠️ Reconocimiento de voz no soportado en este navegador.');
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = language === 'es' ? 'es-ES' : language === 'en' ? 'en-US' : 'el-GR';
    recognitionRef.current.maxAlternatives = 1;

    // Cuando se detecta voz
    recognitionRef.current.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      // Si hay resultado final, enviar
      if (finalTranscript) {
        onTranscript(finalTranscript);
        stopRecording();
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      console.warn('Error de voz:', event.error);
      if (event.error === 'not-allowed') {
        alert('⚠️ Permite el acceso al micrófono en la configuración del navegador.');
      }
      stopRecording();
    };

    recognitionRef.current.onend = () => {
      stopRecording();
    };

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [language]);

  // Iniciar grabación
  const startRecording = () => {
    if (!recognitionRef.current || isDisabled) {
      if (!isSupported) {
        alert('❌ Tu navegador no soporta reconocimiento de voz. Usa Google Chrome.');
      }
      return;
    }

    try {
      recognitionRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error al iniciar:', error);
    }
  };

  // Detener grabación
  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Formatear tiempo
  const formatTime = (seconds: number) => {
    const secs = seconds % 60;
    return `${secs}s`;
  };

  // Si no es soportado, mostrar botón desactivado
  if (!isSupported) {
    return (
      <button
        disabled
        className="px-4 py-2 rounded-xl bg-gray-600 text-gray-400 cursor-not-allowed opacity-50"
        title="Reconocimiento de voz no soportado"
      >
        <Mic className="w-4 h-4" />
      </button>
    );
  }

  return (
    <motion.button
      onMouseDown={startRecording}
      onMouseUp={stopRecording}
      onMouseLeave={stopRecording}
      onTouchStart={startRecording}
      onTouchEnd={stopRecording}
      onTouchCancel={stopRecording}
      disabled={isDisabled}
      whileTap={{ scale: 0.9 }}
      className={`
        relative px-4 py-2 rounded-xl
        transition-all duration-200
        ${isRecording 
          ? 'bg-red-500 text-white scale-110 shadow-lg shadow-red-500/50' 
          : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg hover:shadow-purple-500/30'
        }
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        flex items-center justify-center gap-2
        min-w-[48px] min-h-[48px]
      `}
      title="Mantén presionado para hablar (como Gemini)"
    >
      {isRecording ? (
        <>
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="absolute inline-flex h-full w-full rounded-xl bg-red-500/30 animate-ping"></span>
            <span className="absolute inline-flex h-3/4 w-3/4 rounded-xl bg-red-500/20 animate-pulse"></span>
          </span>
          <div className="relative z-10 flex items-center gap-2">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <MicOff className="w-4 h-4" />
            <span className="text-xs font-medium">{formatTime(recordingTime)}</span>
          </div>
        </>
      ) : (
        <div className="flex items-center gap-1.5">
          <Mic className="w-4 h-4" />
          <span className="text-xs font-medium hidden sm:inline">Voz</span>
        </div>
      )}
    </motion.button>
  );
}