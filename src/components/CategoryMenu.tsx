import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bike, Wrench, Settings, Baby, Accessibility, Zap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface CategoryMenuProps {
  open: boolean;
  onClose: () => void;
}

// Ícono de moto personalizado - versión mejorada y más visible
const MotorcycleIcon = ({ size = 22, color = "#8b5cf6" }: { size?: number; color?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Ruedas */}
    <circle cx="6" cy="16" r="3" fill="none" stroke={color} />
    <circle cx="18" cy="16" r="3" fill="none" stroke={color} />
    
    {/* Chasis principal */}
    <path d="M6 16h12" stroke={color} />
    <path d="M12 6v10" stroke={color} />
    <path d="M8 10h8" stroke={color} />
    
    {/* Motor */}
    <rect x="10" y="8" width="4" height="4" rx="1" fill="none" stroke={color} />
    
    {/* Manillar */}
    <path d="M7 10L5 12" stroke={color} />
    <path d="M17 10L19 12" stroke={color} />
    
    {/* Asiento */}
    <path d="M8 13h8" stroke={color} strokeWidth="1.5" />
  </svg>
);

// Categorías con íconos
const categories = [
  { id: "patinetes", icon: Zap, label: "Patinetes", isCustom: false },
  { id: "bicicletas", icon: Bike, label: "Bicicletas", isCustom: false },
  { id: "motos", icon: MotorcycleIcon, label: "Motos", isCustom: true },
  { id: "accesorios", icon: Wrench, label: "Accesorios", isCustom: false },
  { id: "piezas", icon: Settings, label: "Piezas", isCustom: false },
  { id: "infantiles", icon: Baby, label: "Infantiles", isCustom: false },
  { id: "movilidad-reducida", icon: Accessibility, label: "Movilidad Reducida", isCustom: false },
];

const CategoryMenu = ({ open, onClose }: CategoryMenuProps) => {
  const { lang } = useLanguage();

  const getCategoryName = (catId: string) => {
    const translations: Record<string, Record<string, string>> = {
      patinetes: { es: "Patinetes", en: "Scooters", gr: "Πατίνια" },
      bicicletas: { es: "Bicicletas", en: "Bikes", gr: "Ποδήλατα" },
      motos: { es: "Motos", en: "Motorcycles", gr: "Μοτοσυκλέτες" },
      accesorios: { es: "Accesorios", en: "Accessories", gr: "Αξεσουάρ" },
      piezas: { es: "Piezas", en: "Spare parts", gr: "Ανταλλακτικά" },
      infantiles: { es: "Infantiles", en: "Kids", gr: "Παιδικά" },
      "movilidad-reducida": { es: "Movilidad Reducida", en: "Reduced Mobility", gr: "Μειωμένη Κινητικότητα" },
    };
    
    const cat = translations[catId];
    if (!cat) return catId;
    
    if (lang === 'en') return cat.en;
    if (lang === 'gr') return cat.gr;
    return cat.es;
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-50 lg:hidden"
          />

          {/* Menú lateral desde abajo */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 rounded-t-2xl z-50 lg:hidden max-h-[70vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-black border-b border-gray-800 p-3 flex justify-between items-center">
              <h2 className="font-display font-bold text-base text-white">
                {lang === 'es' ? 'Categorías' : lang === 'en' ? 'Categories' : 'Κατηγορίες'}
              </h2>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-gray-800 rounded-full transition-colors"
              >
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            {/* Grid de categorías */}
            <div className="grid grid-cols-3 gap-3 p-3">
              {categories.map((cat) => {
                const IconComponent = cat.icon;
                
                return (
                  <Link
                    key={cat.id}
                    to={`/categoria/${cat.id}`}
                    onClick={onClose}
                    className="flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 group"
                    style={{ backgroundColor: '#2ecc71' }}
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                      {cat.isCustom ? (
                        <IconComponent size={22} color="#8b5cf6" />
                      ) : (
                        <IconComponent 
                          size={22} 
                          style={{ color: '#8b5cf6', strokeWidth: 1.8 }}
                        />
                      )}
                    </div>
                    <span className="text-[10px] text-center text-white font-medium leading-tight">
                      {getCategoryName(cat.id)}
                    </span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CategoryMenu;