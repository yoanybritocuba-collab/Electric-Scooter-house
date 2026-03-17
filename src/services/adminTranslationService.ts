// Servicio de traducción para el panel admin usando Google Cloud Translation API
const API_KEY = "AIzaSyCS-PgbLLJpam7U0Kxm8vZgpw3GvEl7d_U";

interface TranslationResponse {
  data: {
    translations: {
      translatedText: string;
    }[];
  };
}

// Diccionario de traducciones predefinidas para el panel admin
const adminTranslations: Record<string, Record<string, string>> = {
  es: {
    // Títulos del panel
    "admin.title": "Panel Admin",
    "admin.store": "Ir a tienda",
    "admin.logout": "Cerrar sesión",
    "admin.confirm.delete": "¿Eliminar producto?",
    "admin.error.delete": "Error al eliminar",
    
    // Estadísticas
    "admin.stats.total": "Total",
    "admin.stats.featured": "Destacados",
    "admin.stats.new": "Nuevos",
    "admin.stats.sale": "Ofertas",
    
    // Productos
    "admin.products.title": "Productos",
    "admin.products.search": "Buscar...",
    
    // Menú
    "admin.menu.new_product": "Nuevo Producto",
    "admin.menu.featured": "Destacados",
    "admin.menu.sales": "Ofertas",
    "admin.menu.categories": "Categorías",
    "admin.menu.shipping": "Envíos",
    "admin.menu.info_line": "Línea Informativa",
    "admin.menu.password": "Contraseña",
    
    // Sidebar
    "admin.sidebar.collapse": "Colapsar",
    "admin.sidebar.expand": "Expandir",
    
    // Categorías
    "admin.categories.all": "Todos",
    "admin.categories.scooters": "Patinetes",
    "admin.categories.bikes": "Bicicletas",
    "admin.categories.motorcycles": "Motos",
    "admin.categories.accessories": "Accesorios",
    "admin.categories.spareparts": "Piezas",
    "admin.categories.kids": "Infantiles",
  },
  en: {
    "admin.title": "Admin Panel",
    "admin.store": "Go to store",
    "admin.logout": "Logout",
    "admin.confirm.delete": "Delete product?",
    "admin.error.delete": "Error deleting",
    
    "admin.stats.total": "Total",
    "admin.stats.featured": "Featured",
    "admin.stats.new": "New",
    "admin.stats.sale": "On Sale",
    
    "admin.products.title": "Products",
    "admin.products.search": "Search...",
    
    "admin.menu.new_product": "New Product",
    "admin.menu.featured": "Featured",
    "admin.menu.sales": "On Sale",
    "admin.menu.categories": "Categories",
    "admin.menu.shipping": "Shipping",
    "admin.menu.info_line": "Info Line",
    "admin.menu.password": "Password",
    
    "admin.sidebar.collapse": "Collapse",
    "admin.sidebar.expand": "Expand",
    
    "admin.categories.all": "All",
    "admin.categories.scooters": "Scooters",
    "admin.categories.bikes": "Bikes",
    "admin.categories.motorcycles": "Motorcycles",
    "admin.categories.accessories": "Accessories",
    "admin.categories.spareparts": "Parts",
    "admin.categories.kids": "Kids",
  },
  gr: {
    "admin.title": "Πίνακας Ελέγχου",
    "admin.store": "Μετάβαση στο κατάστημα",
    "admin.logout": "Αποσύνδεση",
    "admin.confirm.delete": "Διαγραφή προϊόντος;",
    "admin.error.delete": "Σφάλμα διαγραφής",
    
    "admin.stats.total": "Σύνολο",
    "admin.stats.featured": "Προτεινόμενα",
    "admin.stats.new": "Νέα",
    "admin.stats.sale": "Προσφορές",
    
    "admin.products.title": "Προϊόντα",
    "admin.products.search": "Αναζήτηση...",
    
    "admin.menu.new_product": "Νέο Προϊόν",
    "admin.menu.featured": "Προτεινόμενα",
    "admin.menu.sales": "Προσφορές",
    "admin.menu.categories": "Κατηγορίες",
    "admin.menu.shipping": "Αποστολές",
    "admin.menu.info_line": "Γραμμή Πληροφοριών",
    "admin.menu.password": "Κωδικός",
    
    "admin.sidebar.collapse": "Σύμπτυξη",
    "admin.sidebar.expand": "Επέκταση",
    
    "admin.categories.all": "Όλα",
    "admin.categories.scooters": "Πατίνια",
    "admin.categories.bikes": "Ποδήλατα",
    "admin.categories.motorcycles": "Μοτοσυκλέτες",
    "admin.categories.accessories": "Αξεσουάρ",
    "admin.categories.spareparts": "Ανταλλακτικά",
    "admin.categories.kids": "Παιδικά",
  }
};

// Función de traducción para el admin (usa el diccionario local)
export const t = (key: string, lang: 'es' | 'en' | 'gr'): string => {
  if (adminTranslations[lang] && adminTranslations[lang][key]) {
    return adminTranslations[lang][key];
  }
  
  // Si no encuentra la traducción, devuelve la clave o intenta español
  if (lang !== 'es' && adminTranslations.es[key]) {
    return adminTranslations.es[key];
  }
  
  return key;
};

// Función para traducir usando Google Translate (modo automático)
export const translateText = async (
  text: string,
  targetLang: string
): Promise<string> => {
  if (!text || text.trim() === "") return "";

  try {
    const target = targetLang === 'gr' ? 'el' : targetLang;
    
    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          q: text,
          target: target,
          format: "text",
        }),
      }
    );

    const data: TranslationResponse = await response.json();
    
    if (data.data?.translations?.[0]?.translatedText) {
      return data.data.translations[0].translatedText;
    }

    return text;
  } catch (error) {
    console.error("Error en traducción:", error);
    return text;
  }
};