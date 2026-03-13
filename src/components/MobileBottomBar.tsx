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

  return (
    <>
      {/* BARRA INFERIOR - SOLO ICONOS */}
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 md:hidden z-50">
        <div className="flex items-center justify-around h-16">
          {/* INICIO - solo icono */}
          <Link to="/" className="flex-1 flex items-center justify-center">
            <Home size={24} className={isActive('/') ? 'text-[#2ecc71]' : 'text-gray-400'} />
          </Link>

          {/* CATEGORÍAS - solo icono */}
          <button 
            onClick={() => setShowCategories(true)}
            className="flex-1 flex items-center justify-center"
          >
            <Grid size={24} className="text-gray-400" />
          </button>

          {/* BUSCADOR - solo icono */}
          <button 
            onClick={() => setShowSearch(true)}
            className="flex-1 flex items-center justify-center"
          >
            <Search size={24} className="text-gray-400" />
          </button>

          {/* CARRITO - solo icono con contador */}
         <Link to="/carrito" className="flex-1 flex items-center justify-center relative">
  <ShoppingCart size={24} className={isActive('/carrito') ? 'text-[#2ecc71]' : 'text-gray-400'} />
  {totalItems > 0 && (
    <span className="absolute -top-1 -right-1 bg-[#2ecc71] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-md">
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