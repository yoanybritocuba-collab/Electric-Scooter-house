import { Link, useLocation } from "react-router-dom";
import { Home, Grid, Search, ShoppingCart, User } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import SearchModal from "./SearchModal";
import CategoryMenu from "./CategoryMenu";

const MobileBottomBar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { totalItems } = useCart();
  const [showSearch, setShowSearch] = useState(false);
  const [showCategories, setShowCategories] = useState(false);

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const getIconColor = (path: string) => {
    if (isActive(path)) return 'text-[#2ecc71]';
    return 'text-gray-400';
  };

  // Obtener nombre de usuario (email truncado o nombre si existe)
  const getUserDisplayName = () => {
    if (!user) return null;
    
    // Si el usuario tiene nombre en el perfil, usarlo
    if (user.displayName) {
      const names = user.displayName.split(' ');
      return names[0]; // Solo el primer nombre
    }
    
    // Si no, usar la parte del email antes del @
    if (user.email) {
      return user.email.split('@')[0];
    }
    
    return 'Usuario';
  };

  const userName = getUserDisplayName();

  return (
    <>
      {/* BARRA INFERIOR - NUEVO ORDEN */}
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 md:hidden z-50 h-16">
        <div className="flex items-center justify-around h-full">
          {/* 1. INICIO */}
          <Link to="/" className="flex items-center justify-center flex-1">
            <Home size={22} className={getIconColor('/')} />
          </Link>

          {/* 2. CATEGORÍAS */}
          <button
            onClick={() => setShowCategories(true)}
            className="flex items-center justify-center flex-1"
          >
            <Grid size={22} className="text-gray-400" />
          </button>

          {/* 3. BUSCADOR */}
          <button
            onClick={() => setShowSearch(true)}
            className="flex items-center justify-center flex-1"
          >
            <Search size={22} className="text-gray-400" />
          </button>

          {/* 4. USUARIO - CON NOMBRE DEBAJO */}
          <Link
            to={user ? "/perfil" : "/login"}
            className="flex flex-col items-center justify-center flex-1 group"
          >
            <User 
              size={22} 
              className={user ? 'text-[#2ecc71]' : 'text-gray-400'} 
            />
            {user && userName && (
              <span className="text-[10px] text-[#2ecc71] mt-0.5 font-medium">
                {userName}
              </span>
            )}
            {!user && (
              <span className="text-[10px] text-gray-500 mt-0.5">
                Invitado
              </span>
            )}
          </Link>

          {/* 5. CARRITO */}
          <Link to="/carrito" className="flex items-center justify-center flex-1 relative">
            <ShoppingCart size={22} className={getIconColor('/carrito')} />
            {totalItems > 0 && (
              <span className="absolute -top-1 left-5 bg-[#2ecc71] text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-md">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Espaciador */}
      <div className="h-16 md:hidden" />

      {/* Modales */}
      <SearchModal open={showSearch} onClose={() => setShowSearch(false)} />
      <CategoryMenu open={showCategories} onClose={() => setShowCategories(false)} />
    </>
  );
};

export default MobileBottomBar;