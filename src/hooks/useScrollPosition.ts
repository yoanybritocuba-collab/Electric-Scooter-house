import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export const useScrollPosition = (key: string) => {
  const location = useLocation();
  const isRestoring = useRef(false);
  const scrollTimeout = useRef<NodeJS.Timeout>();

  // Guardar posición antes de salir - SOLO para productos
  const saveScrollPosition = () => {
    // Solo guardar si es un producto (no categoría)
    if (key.startsWith('producto-')) {
      const currentScroll = window.scrollY;
      sessionStorage.setItem(`scroll-${key}`, currentScroll.toString());
      console.log(`💾 Guardada posición para ${key}:`, currentScroll);
    }
  };

  // Restaurar posición al volver - SOLO para productos
  const restoreScrollPosition = () => {
    // Solo restaurar si es un producto (no categoría)
    if (key.startsWith('producto-')) {
      const savedPosition = sessionStorage.getItem(`scroll-${key}`);
      if (savedPosition) {
        isRestoring.current = true;
        console.log(`🔄 Restaurando posición para ${key}:`, savedPosition);

        window.scrollTo(0, parseInt(savedPosition));

        setTimeout(() => {
          window.scrollTo(0, parseInt(savedPosition));
          isRestoring.current = false;
        }, 300);
      }
    }
  };

  useEffect(() => {
    restoreScrollPosition();

    return () => {
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, [location.pathname]);

  return { saveScrollPosition, restoreScrollPosition };
};