import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, X, Shield } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
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
  const { t } = useLanguage();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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
          <div className="flex items-center ml-[-5px] sm:ml-[-80px] lg:ml-0">
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

          {/* Espaciador */}
          <div className="w-52 sm:w-12 lg:w-0" />

          {/* Desktop nav - 3cm MÁS A LA DERECHA */}
          <div className="hidden lg:flex items-center gap-4 ml-24">
            {navLinks.map((link) => (
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
            ))}
          </div>

          {/* Espaciador flexible */}
          <div className="hidden lg:block flex-1" />

          {/* Iconos de la derecha */}
          <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2 ml-[-75px] sm:ml-0">
            <button
              onClick={() => setSearchOpen(true)}
              className="p-1 sm:p-1.5 md:p-2 text-muted-foreground hover:text-primary transition-colors"
              aria-label={t("nav.search")}
            >
              <Search size={14} className="sm:hidden" />
              <Search size={16} className="hidden sm:block md:hidden" />
              <Search size={18} className="hidden md:block" />
            </button>
            <LanguageSelector />
            <Link
              to="/admin"
              className="lg:hidden p-1 sm:p-1.5 md:p-2 text-primary hover:text-glow transition-colors"
              title="Admin"
            >
              <Shield size={14} className="sm:hidden" />
              <Shield size={16} className="hidden sm:block md:hidden" />
              <Shield size={18} className="hidden md:block" />
            </Link>
            <button
              className="lg:hidden font-display text-xs sm:text-sm tracking-widest text-foreground px-1 sm:px-2"
              onClick={() => setMenuOpen(true)}
            >
              {t("nav.menu")}
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
            className="fixed inset-0 z-[60] bg-background flex flex-col items-center justify-center"
          >
            <button
              onClick={() => setMenuOpen(false)}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground"
            >
              <X size={24} />
            </button>
            <div className="flex flex-col items-center gap-8">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={link.path}
                    className={`font-display text-2xl tracking-widest uppercase flex items-center gap-2 ${
                      location.pathname === link.path
                        ? "text-primary"
                        : "text-foreground"
                    }`}
                  >
                    {link.key === 'admin' && <Shield size={20} className="text-primary" />}
                    {t(`nav.${link.key}`)}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default Navbar;