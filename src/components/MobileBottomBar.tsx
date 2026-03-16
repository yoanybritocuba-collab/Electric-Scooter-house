import { Link, useLocation } from "react-router-dom";
import { Home, Grid, Search, ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";
import SearchModal from "./SearchModal";
import CategoryMenu from "./CategoryMenu";

const MobileBottomBar = () => {
  const location = useLocation();
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

  return (
    <>
      {/* BARRA INFERIOR - SOLO ICONOS */}
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 md:hidden z-50 h-14">
        <div className="flex items-center justify-around h-full">
          {/* INICIO */}
          <Link to="/" className="flex items-center justify-center flex-1">
            <Home size={22} className={getIconColor('/')} />
          </Link>

          {/* CATEGORÍAS */}
          <button 
            onClick={() => setShowCategories(true)}
            className="flex items-center justify-center flex-1"
          >
            <Grid size={22} className="text-gray-400" />
          </button>

          {/* BUSCADOR */}
          <button 
            onClick={() => setShowSearch(true)}
            className="flex items-center justify-center flex-1"
          >
            <Search size={22} className="text-gray-400" />
          </button>

          {/* CARRITO - AJUSTANDO POSICIÓN A LA IZQUIERDA */}
          <Link to="/carrito" className="flex items-center justify-center flex-1 relative">
            <ShoppingCart size={22} className={getIconColor('/carrito')} />
            {totalItems > 0 && (
              <span className="absolute -top-2 left-5 bg-[#2ecc71] text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-md">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Espaciador */}
      <div className="h-14 md:hidden" />

      {/* Modales */}
      <SearchModal open={showSearch} onClose={() => setShowSearch(false)} />
      <CategoryMenu open={showCategories} onClose={() => setShowCategories(false)} />
    </>
  );
};

export default MobileBottomBar;