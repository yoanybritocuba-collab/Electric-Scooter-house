import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Mapa para guardar posiciones de scroll por ruta
const scrollPositions = new Map<string, number>();

export const useScrollRestoration = () => {
  const location = useLocation();

  useEffect(() => {
    // Cuando el usuario hace clic en un enlace, guardar la posición actual
    const handleBeforeUnload = () => {
      scrollPositions.set(location.pathname, window.scrollY);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cuando el usuario vuelve a la página, restaurar la posición
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [location]);

  // Función para guardar posición manualmente
  const saveScrollPosition = () => {
    scrollPositions.set(location.pathname, window.scrollY);
  };

  // Función para restaurar posición
  const restoreScrollPosition = () => {
    const savedPosition = scrollPositions.get(location.pathname);
    if (savedPosition) {
      // Múltiples intentos para asegurar que el DOM está listo
      setTimeout(() => {
        window.scrollTo({
          top: savedPosition,
          behavior: 'auto' // 'smooth' para animación suave
        });
      }, 100);
      
      setTimeout(() => {
        const currentPos = window.scrollY;
        if (Math.abs(currentPos - savedPosition) > 10) {
          window.scrollTo({
            top: savedPosition,
            behavior: 'auto'
          });
        }
      }, 300);
    }
  };

  return { saveScrollPosition, restoreScrollPosition };
};