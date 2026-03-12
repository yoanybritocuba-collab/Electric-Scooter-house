import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Twitter, Youtube } from "lucide-react";

const Footer = () => {
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

  const handleWhatsAppClick = () => {
    window.open('https://wa.me/306993185757', '_blank');
  };

  return (
    <footer className="bg-secondary border-t border-border mt-16">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div>
            <Link to="/" className="inline-block mb-4">
              <img
                src="/images/logo/logo.png"
                alt="Electric Scooter House"
                className="h-16 w-auto"
              />
            </Link>
            <p className="text-muted-foreground text-sm">
              {t("footer.description")}
            </p>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="font-display font-bold text-primary mb-4">{t("footer.contact")}</h3>
            <ul className="space-y-3">
              {/* Dirección */}
              <li>
                <button
                  onClick={handleAddressClick}
                  className="flex items-start gap-2 text-muted-foreground hover:text-primary transition-colors text-sm w-full text-left"
                >
                  <MapPin size={16} className="flex-shrink-0 mt-0.5" />
                  <span>Καρολίδου 10, Νέα Ιωνία 14231</span>
                </button>
              </li>
              
              {/* Teléfono fijo */}
              <li>
                <button
                  onClick={handlePhoneClick}
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm w-full text-left"
                >
                  <Phone size={16} className="flex-shrink-0" />
                  <span>21 0279 9443</span>
                </button>
              </li>
              
              {/* Email */}
              <li>
                <button
                  onClick={handleEmailClick}
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm w-full text-left"
                >
                  <Mail size={16} className="flex-shrink-0" />
                  <span>electrichousescooters@gmail.com</span>
                </button>
              </li>
              
              {/* WhatsApp - NUEVO NÚMERO + ONDAS DE RADIO */}
              <li>
                <button
                  onClick={handleWhatsAppClick}
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm w-full text-left group"
                >
                  <div className="relative">
                    {/* Icono de WhatsApp */}
                    <Phone size={16} className="flex-shrink-0 relative z-10 text-[#25D366]" />
                    
                    {/* ONDAS DE RADIO alrededor del icono */}
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="absolute inline-flex h-8 w-8 rounded-full bg-[#25D366]/20 opacity-75 animate-ping"></span>
                      <span className="absolute inline-flex h-6 w-6 rounded-full bg-[#25D366]/10 opacity-50 animate-ping animation-delay-300"></span>
                      <span className="absolute inline-flex h-4 w-4 rounded-full bg-[#25D366]/5 opacity-25 animate-ping animation-delay-600"></span>
                    </span>
                  </div>
                  <span>WhatsApp: +30 6993 185 757</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Horario */}
          <div>
            <h3 className="font-display font-bold text-primary mb-4">{t("footer.hours")}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Clock size={16} className="flex-shrink-0 mt-0.5" />
                <div>
                  <p>{t("contact.weekdays")}: 10:00 - 20:00</p>
                  <p>{t("contact.saturday")}: 10:00 - 14:00</p>
                  <p>{t("contact.sunday")}: {t("contact.closed")}</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Redes Sociales */}
          <div>
            <h3 className="font-display font-bold text-primary mb-4">{t("footer.follow_us")}</h3>
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-background rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              >
                <Facebook size={18} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-background rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-background rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              >
                <Twitter size={18} />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-background rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              >
                <Youtube size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground text-sm">
          <p>© 2024 Electric Scooter House. {t("footer.rights")}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;