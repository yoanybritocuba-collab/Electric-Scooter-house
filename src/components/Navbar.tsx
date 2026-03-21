import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, X, Shield, ShoppingCart, Menu, User, MessageCircle, Phone, Mail, ChevronDown, ChevronUp, Facebook, Instagram, Youtube, Twitter } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import SearchModal from "./SearchModal";
import LanguageSelector from "./LanguageSelector";

const navLinks = [
  { key: "home", path: "/" },
  { key: "scooters", path: "/categoria/patinetes" },
  { key: "bikes", path: "/categoria/bicicletas" },
  { key: "motos", path: "/categoria/motos" },
  { key: "accessories", path: "/categoria/accesorios" },
  { key: "parts", path: "/categoria/piezas" },
  { key: "kids", path: "/categoria/infantiles" },
  { key: "mobility", path: "/categoria/movilidad-reducida" },
  { key: "admin", path: "/admin" },
];

const Navbar = () => {
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const { totalItems } = useCart();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [horarioOpen, setHorarioOpen] = useState(false);

  const getText = (es: string, en: string, gr: string) => {
    if (lang === 'en') return en;
    if (lang === 'gr') return gr;
    return es;
  };

  const viberNumber = "306993185757";
  const phoneNumber = "6993185757";
  const phoneFijo = "2102799443";
  const email = "info@electricscooterhouse.com";
  const viberLink = `https://msng.link/vi/${viberNumber}`;
  
  const direccion = "Καρολίδου 10, Νέα Ιωνία 14231, Αθήνα";
  const direccionLink = "https://maps.google.com/?q=Καρολίδου+10+Νέα+Ιωνία+14231";

  const horarios = {
    es: "Lunes a Viernes: 10:00 - 20:00\nSábados: 10:00 - 14:00\nDomingos: Cerrado",
    en: "Monday to Friday: 10:00 - 20:00\nSaturdays: 10:00 - 14:00\nSundays: Closed",
    gr: "Δευτέρα έως Παρασκευή: 10:00 - 20:00\nΣάββατο: 10:00 - 14:00\nΚυριακή: Κλειστά"
  };

  const getHorario = () => {
    if (lang === 'en') return horarios.en;
    if (lang === 'gr') return horarios.gr;
    return horarios.es;
  };

  useEffect(() => {
    console.log("🌐 Idioma actual en Navbar:", lang);
  }, [lang]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setContactOpen(false);
    setHorarioOpen(false);
  }, [location]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-background/95 backdrop-blur-md border-b border-border" : "bg-background/80 backdrop-blur-sm"
        }`}
        style={{ height: "80px" }}
      >
        <div className="w-full h-full flex items-center justify-between px-4 md:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 md:gap-4 h-full py-2 flex-shrink-0">
            <img
              src="/images/logo/logo.png"
              alt="Electric Scooter House"
              className="h-10 sm:h-12 md:h-16 w-auto"
            />
            <div className="flex flex-col font-display font-bold text-primary leading-tight">
              <span className="text-xs sm:text-sm md:text-lg tracking-tight whitespace-nowrap">ELECTRIC SCOOTER</span>
              <span className="text-sm sm:text-base md:text-xl tracking-tight">HOUSE</span> 
            </div>
          </Link>

          <div className="flex-1" />

          <div className="hidden lg:flex items-center gap-2 xl:gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.key}
                to={link.path}
                className={`font-display text-xs tracking-widest uppercase transition-colors duration-200 flex items-center gap-1 px-2 py-1 ${
                  location.pathname === link.path
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                } ${link.key === 'admin' ? 'text-primary border border-primary/30 px-3 py-1 rounded-full hover:bg-primary/10' : ''}`}
              >
                {link.key === 'admin' && <Shield size={14} />}
                {t(`nav.${link.key}`)}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3 xl:gap-4 ml-2 xl:ml-4">
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 text-muted-foreground hover:text-primary transition-colors"    
              aria-label={t("nav.search")}
            >
              <Search size={18} />
            </button>

            <Link
              to="/carrito"
              className="p-2 text-muted-foreground hover:text-primary transition-colors relative"
              aria-label="Carrito"
            >
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#2ecc71] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-md">
                  {totalItems}
                </span>
              )}
            </Link>

            <Link
              to={user ? "/perfil" : "/login"}
              className="p-2 text-muted-foreground hover:text-primary transition-colors"
              title={user ? "Mi Perfil" : "Iniciar Sesión"}
            >
              <User size={18} />
            </Link>

            <LanguageSelector />
          </div>

          <div className="flex lg:hidden items-center gap-3">
            <Link
              to="/admin"
              className="p-2 text-primary hover:text-glow transition-colors"
              title="Admin"
            >
              <Shield size={22} />
            </Link>

            <LanguageSelector />

            <button
              className="p-2 text-foreground hover:text-primary transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menú"
            >
              {menuOpen ? (
                <X size={24} className="text-[#2ecc71]" />
              ) : (
                <Menu size={24} />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black lg:hidden overflow-y-auto"
            style={{ top: '80px' }}
          >
            <div className="flex flex-col items-center justify-start pt-4 pb-8">
              {/* Buscador */}
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setSearchOpen(true);
                }}
                className="w-full py-4 text-center text-white text-lg hover:text-[#2ecc71] transition-colors border-b border-gray-800"
              >
                🔍 {t("nav.search") || "Buscar"}
              </button>

              {/* Enlaces de navegación */}
              {navLinks.map((link) => (
                <Link
                  key={link.key}
                  to={link.path}
                  onClick={() => setMenuOpen(false)}
                  className={`w-full py-4 text-center text-lg transition-colors border-b border-gray-800 ${
                    location.pathname === link.path
                      ? "text-[#2ecc71]"
                      : "text-white hover:text-[#2ecc71]"
                  }`}
                >
                  {t(`nav.${link.key}`)}
                </Link>
              ))}

              {/* CONTACTO DESPLEGABLE */}
              <div className="w-full border-b border-gray-800">
                <button
                  onClick={() => setContactOpen(!contactOpen)}
                  className="w-full py-4 text-center text-white text-lg hover:text-[#2ecc71] transition-colors flex items-center justify-center gap-2"
                >
                  <span>📞 {getText("CONTACTO", "CONTACT", "ΕΠΙΚΟΙΝΩΝΙΑ")}</span>
                  {contactOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                
                <AnimatePresence>
                  {contactOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden bg-black/50"
                    >
                      <a
                        href={viberLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setMenuOpen(false)}
                        className="w-full py-3 text-center text-purple-400 hover:text-purple-300 transition-colors flex items-center justify-center gap-3 border-t border-gray-800"
                      >
                        <MessageCircle size={20} />
                        <span className="text-base">Viber</span>
                        <span className="text-xs text-gray-500">+{phoneNumber}</span>
                      </a>

                      <a
                        href={`https://wa.me/${viberNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setMenuOpen(false)}
                        className="w-full py-3 text-center text-green-500 hover:text-green-400 transition-colors flex items-center justify-center gap-3 border-t border-gray-800"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654z"/>
                        </svg>
                        <span className="text-base">WhatsApp</span>
                        <span className="text-xs text-gray-500">+{phoneNumber}</span>
                      </a>

                      <a
                        href={`tel:+${phoneNumber}`}
                        onClick={() => setMenuOpen(false)}
                        className="w-full py-3 text-center text-gray-300 hover:text-white transition-colors flex items-center justify-center gap-3 border-t border-gray-800"
                      >
                        <Phone size={18} />
                        <span className="text-base">Teléfono Móvil</span>
                        <span className="text-xs text-gray-500">+{phoneNumber}</span>
                      </a>

                      <a
                        href={`tel:+30${phoneFijo}`}
                        onClick={() => setMenuOpen(false)}
                        className="w-full py-3 text-center text-gray-300 hover:text-white transition-colors flex items-center justify-center gap-3 border-t border-gray-800"
                      >
                        <Phone size={18} />
                        <span className="text-base">Teléfono Fijo</span>
                        <span className="text-xs text-gray-500">+30 {phoneFijo}</span>
                      </a>

                      <a
                        href={`mailto:${email}`}
                        onClick={() => setMenuOpen(false)}
                        className="w-full py-3 text-center text-gray-300 hover:text-white transition-colors flex items-center justify-center gap-3 border-t border-gray-800"
                      >
                        <Mail size={18} />
                        <span className="text-base">Email</span>
                        <span className="text-xs text-gray-500 truncate max-w-[150px]">{email}</span>
                      </a>

                      <a
                        href={direccionLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setMenuOpen(false)}
                        className="w-full py-3 text-center text-gray-300 hover:text-white transition-colors flex items-center justify-center gap-3 border-t border-gray-800"
                      >
                        <MapPin size={18} />
                        <span className="text-base">Ubicación</span>
                        <span className="text-xs text-gray-500 truncate max-w-[200px]">{direccion}</span>
                      </a>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* HORARIO DESPLEGABLE */}
              <div className="w-full border-b border-gray-800">
                <button
                  onClick={() => setHorarioOpen(!horarioOpen)}
                  className="w-full py-4 text-center text-white text-lg hover:text-[#2ecc71] transition-colors flex items-center justify-center gap-2"
                >
                  <span>⏰ {getText("HORARIO", "SCHEDULE", "ΩΡΑΡΙΟ")}</span>
                  {horarioOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                
                <AnimatePresence>
                  {horarioOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden bg-black/50"
                    >
                      <div className="py-4 px-4 text-center text-gray-300 text-sm whitespace-pre-line border-t border-gray-800">
                        {getHorario()}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Perfil */}
              <Link
                to={user ? "/perfil" : "/login"}
                onClick={() => setMenuOpen(false)}
                className="w-full py-4 text-center text-white text-lg hover:text-[#2ecc71] transition-colors border-b border-gray-800"
              >
                {user ? "👤 Mi Perfil" : "🔐 Iniciar Sesión"}
              </Link>

              {/* Carrito */}
              <Link
                to="/carrito"
                onClick={() => setMenuOpen(false)}
                className="w-full py-4 text-center text-white text-lg hover:text-[#2ecc71] transition-colors border-b border-gray-800 flex items-center justify-center gap-2"
              >
                🛒 Carrito
                {totalItems > 0 && (
                  <span className="bg-[#2ecc71] text-black text-xs px-2 py-0.5 rounded-full">
                    {totalItems}
                  </span>
                )}
              </Link>

              {/* ========== REDES SOCIALES - AL FINAL ========== */}
              <div className="w-full">
                <p className="w-full py-4 text-center text-white text-lg font-bold">
                  🌐 {getText("REDES SOCIALES", "SOCIAL MEDIA", "ΚΟΙΝΩΝΙΚΑ ΔΙΚΤΥΑ")}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-6 py-4">
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMenuOpen(false)}
                    className="flex flex-col items-center gap-1 group"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#1877f2] flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform">
                      <Facebook size={24} />
                    </div>
                    <span className="text-xs text-gray-400">Facebook</span>
                  </a>

                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMenuOpen(false)}
                    className="flex flex-col items-center gap-1 group"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#f09433] via-[#d62976] to-[#962fbf] flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform">
                      <Instagram size={24} />
                    </div>
                    <span className="text-xs text-gray-400">Instagram</span>
                  </a>

                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMenuOpen(false)}
                    className="flex flex-col items-center gap-1 group"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#ff0000] flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform">
                      <Youtube size={24} />
                    </div>
                    <span className="text-xs text-gray-400">YouTube</span>
                  </a>

                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMenuOpen(false)}
                    className="flex flex-col items-center gap-1 group"
                  >
                    <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform border border-gray-700">
                      <Twitter size={24} />
                    </div>
                    <span className="text-xs text-gray-400">Twitter</span>
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default Navbar;