import { useLanguage } from "@/contexts/LanguageContext";
import { MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react";

const ContactPage = () => {
  const { t } = useLanguage();

  const handlePhoneClick = () => {
    window.location.href = 'tel:+302102799443';
  };

  const handleEmailClick = () => {
    window.location.href = 'mailto:electrichousescooters@gmail.com';
  };

  const handleAddressClick = () => {
    window.open('https://maps.google.com/?q=Καρολίδου+10+Νέα+Ιωνία+14231', '_blank');
  };

  const handleViberClick = () => {
    window.open('viber://chat?number=+306993185757', '_blank');
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 lg:px-8">
        <h1 className="font-display font-bold text-3xl md:text-4xl tracking-tight text-white mb-8">
          {t("contact.title")}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Información de contacto */}
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-lg p-6">
              <h2 className="font-display font-bold text-xl text-white mb-4">Información de contacto</h2>
              
              {/* Dirección */}
              <button
                onClick={handleAddressClick}
                className="w-full flex items-start gap-3 text-left mb-4 group hover:bg-gray-800 p-3 rounded-lg transition-colors"
              >
                <MapPin size={20} className="text-[#2ecc71] flex-shrink-0 mt-1" />
                <div>
                  <p className="text-white font-medium">Dirección</p>
                  <p className="text-gray-400 text-sm">Καρολίδου 10, Νέα Ιωνία 14231</p>
                </div>
              </button>

              {/* Teléfono fijo */}
              <button
                onClick={handlePhoneClick}
                className="w-full flex items-start gap-3 text-left mb-4 group hover:bg-gray-800 p-3 rounded-lg transition-colors"
              >
                <Phone size={20} className="text-[#2ecc71] flex-shrink-0 mt-1" />
                <div>
                  <p className="text-white font-medium">Teléfono fijo</p>
                  <p className="text-gray-400 text-sm">21 0279 9443</p>
                </div>
              </button>

              {/* Email */}
              <button
                onClick={handleEmailClick}
                className="w-full flex items-start gap-3 text-left mb-4 group hover:bg-gray-800 p-3 rounded-lg transition-colors"
              >
                <Mail size={20} className="text-[#2ecc71] flex-shrink-0 mt-1" />
                <div>
                  <p className="text-white font-medium">Email</p>
                  <p className="text-gray-400 text-sm">electrichousescooters@gmail.com</p>
                </div>
              </button>

              {/* VIBER - con ondas moradas */}
              <button
                onClick={handleViberClick}
                className="w-full flex items-start gap-3 text-left group hover:bg-gray-800 p-3 rounded-lg transition-colors relative overflow-hidden"
              >
                {/* Efecto de ondas moradas */}
                <span className="absolute inset-0 flex items-center justify-start ml-12">
                  <span className="absolute inline-flex h-8 w-8 rounded-full bg-[#7360F2]/40 opacity-75 animate-ping"></span>
                  <span className="absolute inline-flex h-6 w-6 rounded-full bg-[#7360F2]/30 opacity-50 animate-ping animation-delay-300"></span>
                  <span className="absolute inline-flex h-4 w-4 rounded-full bg-[#7360F2]/20 opacity-25 animate-ping animation-delay-600"></span>
                </span>
                
                <MessageCircle size={20} className="text-[#7360F2] flex-shrink-0 mt-1 relative z-10" />
                <div className="relative z-10">
                  <p className="text-white font-medium">Viber</p>
                  <p className="text-gray-400 text-sm">+30 6993 185 757</p>
                </div>
              </button>
            </div>
          </div>

          {/* Horario */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="font-display font-bold text-xl text-white mb-4">Horario de atención</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Clock size={20} className="text-[#2ecc71] flex-shrink-0 mt-1" />
                <div>
                  <p className="text-white font-medium">Lunes a Viernes</p>
                  <p className="text-gray-400">10:00 - 20:00</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock size={20} className="text-[#2ecc71] flex-shrink-0 mt-1" />
                <div>
                  <p className="text-white font-medium">Sábados</p>
                  <p className="text-gray-400">10:00 - 14:00</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock size={20} className="text-[#2ecc71] flex-shrink-0 mt-1" />
                <div>
                  <p className="text-white font-medium">Domingos</p>
                  <p className="text-gray-400">Cerrado</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;