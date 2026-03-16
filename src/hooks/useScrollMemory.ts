import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Hook simple y directo
export const useScrollMemory = (key: string) => {
  const location = useLocation();

  // Guardar scroll
  const saveScroll = () => {
    const scrollY = window.scrollY;
    if (scrollY > 0) {
      sessionStorage.setItem(`mem_${key}`, scrollY.toString());
      console.log(`💾 Guardado ${key}: ${scrollY}`);
    }
  };

  // Restaurar scroll
  useEffect(() => {
    const saved = sessionStorage.getItem(`mem_${key}`);
    if (saved) {
      // Intentar varias veces hasta que funcione
      let attempts = 0;
      const interval = setInterval(() => {
        window.scrollTo(0, parseInt(saved));
        attempts++;
        if (attempts > 10) clearInterval(interval);
      }, 100);
    }
  }, [location.pathname]);

  return { saveScroll };
};