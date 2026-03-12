import { MessageCircle } from "lucide-react";

const WhatsAppButton = () => {
  return (
    <a
      href="https://wa.me/306993185757"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
      aria-label="WhatsApp"
    >
      {/* Efecto de ondas de radio */}
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="absolute inline-flex h-full w-full rounded-full bg-white/30 opacity-75 animate-ping"></span>
        <span className="absolute inline-flex h-3/4 w-3/4 rounded-full bg-white/20 opacity-50 animate-ping animation-delay-300"></span>
        <span className="absolute inline-flex h-1/2 w-1/2 rounded-full bg-white/10 opacity-25 animate-ping animation-delay-600"></span>
      </span>
      
      {/* Icono */}
      <MessageCircle size={28} className="relative z-10" />
    </a>
  );
};

export default WhatsAppButton;