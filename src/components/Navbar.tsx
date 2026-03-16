import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, X, Shield, ShoppingCart, Menu } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
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
  { key: "contact", path: "/contacto" },
  { key: "admin", path: "/admin" },
];

const Navbar = () => {
  const { t, lang } = useLanguage(); // 👈 AÑADIDO 'lang' para debugging
  const { totalItems } = useCart();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Debug: Verificar cambios de idioma
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
  }, [location]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-background/95 backdrop-blur-md border-b border-border" : "bg-background/80 backdrop-blur-sm"
        }`}
        style={{ height: "80px" }}
      >
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-2 sm:px-4 lg:px-8">
          {/* Logo y nombre */}
          <div className="flex items-center ml-[-5px] sm:ml-[-80px] lg:ml-[-120px]">
            <Link to="/" className="flex items-center gap-1 sm:gap-2 md:gap-4 h-full py-1 sm:py-2 flex-shrink-0">
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
          </div>

          {/* Espaciador flexible */}
          <div className="flex-1" />

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-4 ml-24">
            {navLinks.map((link) => {
              // Debug para cada link
              console.log(`🔤 ${link.key}: ${t(`nav.${link.key}`)}`);
              return (
                <Link
                  key={link.key}
                  to={link.path}
                  className={`font-display text-xs tracking-widest uppercase transition-colors duration-200 flex items-center gap-1 px-2 ${
                    location.pathname === link.path
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  } ${link.key === 'admin' ? 'text-primary border border-primary/30 px-3 py-1 rounded-full hover:bg-primary/10' : ''}`}
                >
                  {link.key === 'admin' && <Shield size={14} />}
                  {t(`nav.${link.key}`)}
                </Link>
              );
            })}
          </div>

          {/* Iconos de la derecha */}
          <div className="hidden lg:flex items-center gap-4 ml-4">
            <button
              onClick={() => setSearchOpen(true)}
              className="p-1 sm:p-1.5 md:p-2 text-muted-foreground hover:text-primary transition-colors"
              aria-label={t("nav.search")}
            >
              <Search size={16} />
            </button>
            
            <Link
              to="/carrito"
              className="p-1 sm:p-1.5 md:p-2 text-muted-foreground hover:text-primary transition-colors relative"
              aria-label="Carrito"
            >
              <ShoppingCart size={18} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#2ecc71] text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-md">
                  {totalItems}
                </span>
              )}
            </Link>
            
            <LanguageSelector />
          </div>

          {/* MÓVIL - Iconos para móvil */}
          <div className="flex lg:hidden items-center gap-4 sm:gap-6 ml-[-75px] sm:ml-0">
            <Link
              to="/admin"
              className="p-2 text-primary hover:text-glow transition-colors"
              title="Admin"
            >
              <Shield size={22} />
            </Link>
            
            <LanguageSelector />
            
            <button
              className="p-2 text-foreground hover:text-primary transition-colors w-10 h-10 flex items-center justify-center"
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
            className="fixed inset-0 z-[60] bg-black lg:hidden"
            style={{ top: '80px' }}
          >
            <div className="flex flex-col items-center justify-start pt-8">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setSearchOpen(true);
                }}
                className="w-full py-4 text-center text-white text-lg hover:text-[#2ecc71] transition-colors border-b border-gray-800"
              >
                Buscar
              </button>
              
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
              
              <Link
                to="/carrito"
                onClick={() => setMenuOpen(false)}
                className="w-full py-4 text-center text-white text-lg hover:text-[#2ecc71] transition-colors border-b border-gray-800"
              >
                Carrito {totalItems > 0 && `(${totalItems})`}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default Navbar;