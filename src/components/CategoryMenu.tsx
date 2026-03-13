import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface CategoryMenuProps {
  open: boolean;
  onClose: () => void;
}

const categories = [
  { id: "patinetes", icon: "🛴", color: "from-blue-500 to-cyan-500" },
  { id: "bicicletas", icon: "🚲", color: "from-green-500 to-emerald-500" },
  { id: "motos", icon: "🏍️", color: "from-red-500 to-orange-500" },
  { id: "accesorios", icon: "🧤", color: "from-purple-500 to-pink-500" },
  { id: "piezas", icon: "🔧", color: "from-yellow-500 to-amber-500" },
  { id: "infantiles", icon: "🧸", color: "from-pink-500 to-rose-500" },
  { id: "movilidad-reducida", icon: "♿", color: "from-indigo-500 to-violet-500" },
];

const CategoryMenu = ({ open, onClose }: CategoryMenuProps) => {
  const { t } = useLanguage();

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
            className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 rounded-t-2xl z-50 lg:hidden max-h-[80vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-black border-b border-gray-800 p-4 flex justify-between items-center">
              <h2 className="font-display font-bold text-lg text-white">Categorías</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-800 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            {/* Grid de categorías estilo Temu */}
            <div className="grid grid-cols-3 gap-4 p-4">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/categoria/${cat.id}`}
                  onClick={onClose}
                  className="flex flex-col items-center gap-2 p-3 bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors group"
                >
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${cat.color} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
                    {cat.icon}
                  </div>
                  <span className="text-xs text-center text-gray-300">
                    {t(`categories.${cat.id}`)}
                  </span>
                </Link>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CategoryMenu;