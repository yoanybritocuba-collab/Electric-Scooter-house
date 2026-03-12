import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Twitter, Youtube } from "lucide-react";

const Footer = () => {
  const { t } = useLanguage();

  const handlePhoneClick = () => {
    window.location.href = 'tel:+302102799443';
  };

  const handleMobileClick = () => {
    window.location.href = 'tel:+30693185757';
  };

  const handleEmailClick = () => {
    window.location.href = 'mailto:electrichousescooters@gmail.com';
  };

  const handleAddressClick = () => {
    window.open('https://maps.google.com/?q=Καρολίδου+10+Νέα+Ιωνία+14231', '_blank');
  };

  const handleWhatsAppClick = () => {
    window.open('https://wa.me/30693185757', '_blank');
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
              Τι εξειδικευμένο κατάστημα ηλεκτρικής κινητικότητας. Ποιότητα και εμπιστοσύνη από το 2020.
            </p>
          </div>

          {/* Contacto clickeable con datos reales */}
          <div>
            <h3 className="font-display font-bold text-primary mb-4">Επικοινωνία</h3>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={handleAddressClick}
                  className="flex items-start gap-2 text-muted-foreground hover:text-primary transition-colors text-sm w-full text-left"
                >
                  <MapPin size={16} className="flex-shrink-0 mt-0.5" />
                  <span>Καρολίδου 10, Νέα Ιωνία 14231</span>
                </button>
              </li>
              <li>
                <button
                  onClick={handlePhoneClick}
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm w-full text-left"
                >
                  <Phone size={16} className="flex-shrink-0" />
                  <span>21 0279 9443</span>
                </button>
              </li>
              <li>
                <button
                  onClick={handleMobileClick}
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm w-full text-left"
                >
                  <Phone size={16} className="flex-shrink-0" />
                  <span>693 185 757</span>
                </button>
              </li>
              <li>
                <button
                  onClick={handleEmailClick}
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm w-full text-left"
                >
                  <Mail size={16} className="flex-shrink-0" />
                  <span>electrichousescooters@gmail.com</span>
                </button>
              </li>
              <li>
                <button
                  onClick={handleWhatsAppClick}
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm w-full text-left"
                >
                  <Phone size={16} className="flex-shrink-0" />
                  <span>WhatsApp: 693 185 757</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Horario */}
          <div>
            <h3 className="font-display font-bold text-primary mb-4">Ώρες Λειτουργίας</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Clock size={16} className="flex-shrink-0 mt-0.5" />
                <div>
                  <p>Δευτέρα - Παρασκευή: 10:00 - 20:00</p>
                  <p>Σάββατο: 10:00 - 14:00</p>
                  <p>Κυριακή: Κλειστά</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Redes Sociales */}
          <div>
            <h3 className="font-display font-bold text-primary mb-4">Ακολουθήστε μας</h3>
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
          <p>© 2024 Electric Scooter House. Με επιφύλαξη παντός δικαιώματος.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;