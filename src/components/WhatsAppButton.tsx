import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Grid, Search, ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import SearchModal from "./SearchModal";
import CategoryMenu from "./CategoryMenu";

const MobileBottomBar = () => {
  const location = useLocation();
  const { totalItems } = useCart();
  const [showSearch, setShowSearch] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [pressedIcon, setPressedIcon] = useState<string | null>(null);

  useEffect(() => {
    if (pressedIcon) {
      const timer = setTimeout(() => {
        setPressedIcon(null);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [pressedIcon]);

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const getIconColor = (path: string, iconName: string) => {
    if (pressedIcon === iconName) return 'text-[#2ecc71]';
    if (isActive(path)) return 'text-[#2ecc71]';
    return 'text-gray-400';
  };

  const handlePress = (iconName: string) => {
    setPressedIcon(iconName);
  };

  return (
    <>
      {/* ÚNICA BARRA INFERIOR */}
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 md:hidden z-50 h-14">
        <div className="flex items-center justify-around h-full">
          <Link
            to="/"
            className="flex flex-col items-center justify-center flex-1"
            onTouchStart={() => handlePress('home')}
            onMouseDown={() => handlePress('home')}
          >
            <Home size={20} className={getIconColor('/', 'home')} />
            <span className={`text-[10px] mt-0.5 ${getIconColor('/', 'home')}`}>Inicio</span>
          </Link>

          <button
            onClick={() => setShowCategories(true)}
            className="flex flex-col items-center justify-center flex-1"
            onTouchStart={() => handlePress('categories')}
            onMouseDown={() => handlePress('categories')}
          >
            <Grid size={20} className={getIconColor('/categoria', 'categories')} />
            <span className={`text-[10px] mt-0.5 ${getIconColor('/categoria', 'categories')}`}>Categorías</span>
          </button>

          <button
            onClick={() => setShowSearch(true)}
            className="flex flex-col items-center justify-center flex-1"
            onTouchStart={() => handlePress('search')}
            onMouseDown={() => handlePress('search')}
          >
            <Search size={20} className={getIconColor('/search', 'search')} />
            <span className={`text-[10px] mt-0.5 ${getIconColor('/search', 'search')}`}>Buscar</span>
          </button>

          <Link
            to="/carrito"
            className="flex flex-col items-center justify-center flex-1 relative"
            onTouchStart={() => handlePress('cart')}
            onMouseDown={() => handlePress('cart')}
          >
            <ShoppingCart size={20} className={getIconColor('/carrito', 'cart')} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-0 bg-[#2ecc71] text-white text-[8px] rounded-full w-4 h-4 flex items-center justify-center">
                {totalItems}
              </span>
            )}
            <span className={`text-[10px] mt-0.5 ${getIconColor('/carrito', 'cart')}`}>Carrito</span>
          </Link>
        </div>
      </div>

      {/* Espaciador - UNA SOLA VEZ */}
      <div className="h-14 md:hidden" />

      <SearchModal open={showSearch} onClose={() => setShowSearch(false)} />
      <CategoryMenu open={showCategories} onClose={() => setShowCategories(false)} />
    </>
  );
};

export default MobileBottomBar;