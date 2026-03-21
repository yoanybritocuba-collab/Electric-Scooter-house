import { Link, useLocation } from "react-router-dom";
import { Home, Grid, Search, ShoppingCart, User, MessageCircle } from "lucide-react";
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

  const viberNumber = "306993185757";
  const viberLink = `https://msng.link/vi/${viberNumber}`;

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const getIconColor = (path: string) => {
    if (isActive(path)) return 'text-[#2ecc71]';
    return 'text-gray-400';
  };

  const getUserDisplayName = () => {
    if (!user) return null;
    if (user.displayName) {
      const names = user.displayName.split(' ');
      return names[0];
    }
    if (user.email) {
      return user.email.split('@')[0];
    }
    return 'Usuario';
  };

  const userName = getUserDisplayName();

  return (
    <>
      {/* BARRA INFERIOR - CON VIBER */}
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

          {/* 4. VIBER - NUEVO ICONO IMPORTANTE */}
          <a
            href={viberLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center flex-1 group"
          >
            <MessageCircle size={22} className="text-purple-500 group-hover:text-purple-400 transition-colors" />
            <span className="text-[9px] text-purple-500 mt-0.5">Viber</span>
          </a>

          {/* 5. USUARIO */}
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

          {/* 6. CARRITO */}
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