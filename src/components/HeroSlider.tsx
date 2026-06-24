import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const slides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1920&q=80",
    gradient: "from-background/90 via-background/60 to-transparent",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=1920&q=80",
    gradient: "from-background/90 via-background/60 to-transparent",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1619624667584-c9e5e1cd5ab7?w=1920&q=80",
    gradient: "from-background/90 via-background/60 to-transparent",
  },
];

const HeroSlider = () => {
  const { t } = useLanguage();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);
  const next = () => setCurrent((c) => (c + 1) % slides.length);

  return (
    <div className="relative h-[85vh] overflow-hidden bg-background">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <img
            src={slides[current].image}
            alt="Hero"
            className="w-full h-full object-cover"
          />
          <div className={`absolute inset-0 bg-gradient-to-r ${slides[current].gradient}`} />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 flex items-center">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 w-full">
          <motion.h1
            key={`title-${current}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="font-display font-bold text-4xl md:text-6xl lg:text-7xl tracking-tight text-foreground max-w-2xl"
          >
            {t("home.hero_title")}
          </motion.h1>
          <motion.p
            key={`sub-${current}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-muted-foreground text-lg mt-4 max-w-lg"
          >
            {t("home.hero_subtitle")}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            <Link
              to="/categoria/patinetes"
              className="inline-block mt-8 bg-primary text-primary-foreground font-display font-bold tracking-widest text-sm px-8 py-4 rounded transition-all duration-300 hover:bg-glow"
            >
              {t("home.hero_cta")}
            </Link>
          </motion.div>
        </div>
      </div>

      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-foreground/60 hover:text-foreground transition-colors"
      >
        <ChevronLeft size={32} />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-foreground/60 hover:text-foreground transition-colors"
      >
        <ChevronRight size={32} />
      </button>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === current ? "bg-primary w-8" : "bg-foreground/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
