import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Solo hacer scroll cuando NO hay un zoom abierto
    const zoomOpen = document.querySelector('[data-zoom-open="true"]');
    if (!zoomOpen) {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  // Detectar tecla Inicio - SOLO SCROLL, sin navegación
  useEffect(() => {
    const handleHomeKey = (e: KeyboardEvent) => {
      if (e.key === 'Home') {
        e.preventDefault();
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    };

    window.addEventListener('keydown', handleHomeKey);
    return () => window.removeEventListener('keydown', handleHomeKey);
  }, []);

  return null;
};

export default ScrollToTop;