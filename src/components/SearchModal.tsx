import { useState, useEffect, useMemo } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/config";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import { X, Search } from "lucide-react";
import Fuse from "fuse.js";
import { motion, AnimatePresence } from "framer-motion";

interface Product {
  id: string;
  nombre: string;
  precio: number;
  categoria: string;
  imagenes: string[];
}

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

const SearchModal = ({ open, onClose }: SearchModalProps) => {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (open && products.length === 0) {
      getDocs(collection(db, "productos")).then((snap) => {
        setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product)));
      });
    }
  }, [open]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const fuse = useMemo(
    () =>
      new Fuse(products, {
        keys: ["nombre", "categoria", "descripcion"],
        threshold: 0.4,
        distance: 100,
        includeScore: true,
      }),
    [products]
  );

  const results = query.length > 1 ? fuse.search(query).slice(0, 8) : [];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] bg-background/95 backdrop-blur-md flex flex-col items-center pt-24 px-4"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground"
          >
            <X size={24} />
          </button>

          <div className="w-full max-w-xl">
            <div className="flex items-center gap-3 border-b border-border pb-4 mb-6">
              <Search size={20} className="text-primary" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("search.placeholder")}
                className="flex-1 bg-transparent text-2xl font-display text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-2">
              {results.map(({ item }) => (
                <Link
                  key={item.id}
                  to={`/producto/${item.id}`}
                  onClick={onClose}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary transition-colors"
                >
                  {item.imagenes?.[0] && (
                    <img
                      src={item.imagenes[0]}
                      alt={item.nombre}
                      className="w-14 h-14 object-cover rounded"
                    />
                  )}
                  <div>
                    <p className="font-display text-sm text-foreground">{item.nombre}</p>
                    <p className="text-primary font-bold">{item.precio}€</p>
                  </div>
                </Link>
              ))}
              {query.length > 1 && results.length === 0 && (
                <p className="text-center text-muted-foreground py-8">{t("search.no_results")}</p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchModal;
