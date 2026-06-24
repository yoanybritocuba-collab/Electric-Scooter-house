import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Navigate, Link, useNavigate } from "react-router-dom";
import { collection, getDocs, doc, deleteDoc, updateDoc, arrayRemove } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "@/firebase/config";
import {
  Package, Plus, Pencil, Trash2, LogOut,
  Star, Percent, FolderOpen,
  Settings, Search, Baby, Bike, Car, Zap, Wrench, X, Truck,
  MessageSquare,
  ShoppingBag, Shield,
  Home, LogOut as LogOutIcon,
  ChevronLeft, ChevronRight,
  Sparkles,
  Clock,
  Accessibility
} from "lucide-react";
import { t } from "@/services/adminTranslationService";

interface Product {
  id: string;
  nombre: string;
  precio: number;
  categoria: string;
  imagenes: string[];
  masVendido?: boolean;
  nuevo?: boolean;
  rebaja?: boolean;
  variantes?: any[];
}

const AdminDashboard = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("todos");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogoutAndGoHome = async () => {
    await logout();
    navigate("/");
  };

  const categories = [
    { id: "todos", nombre: t("admin.categories.all", lang), icon: Package },
    { id: "patinetes", nombre: t("admin.categories.scooters", lang), icon: Zap },
    { id: "bicicletas", nombre: t("admin.categories.bikes", lang), icon: Bike },
    { id: "motos", nombre: t("admin.categories.motorcycles", lang), icon: Car },
    { id: "accesorios", nombre: t("admin.categories.accessories", lang), icon: Wrench },
    { id: "piezas", nombre: t("admin.categories.spareparts", lang), icon: Settings },
    { id: "infantiles", nombre: t("admin.categories.kids", lang), icon: Baby },
    { id: "movilidad-reducida", nombre: t("admin.categories.reduced_mobility", lang), icon: Accessibility },
  ];

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    let filtered = products;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.nombre.toLowerCase().includes(term) ||
        p.categoria.toLowerCase().includes(term) ||
        p.precio.toString().includes(term)
      );
    }

    if (selectedCategory !== "todos") {
      filtered = filtered.filter(p => p.categoria === selectedCategory);
    }

    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, products]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "productos"));
      const loadedProducts = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          nombre: data.nombre || "",
          precio: data.precio || 0,
          categoria: data.categoria || "",
          imagenes: data.imagenes || [],
          masVendido: data.masVendido === true,
          nuevo: data.nuevo === true,
          rebaja: data.rebaja === true,
          variantes: data.variantes || []
        } as Product;
      });
      setProducts(loadedProducts);
      setFilteredProducts(loadedProducts);
    } catch (error) {
      console.error("Error cargando productos:", error);
    }
    setLoading(false);
  };

  const deleteProductImages = async (product: Product) => {
    const deletePromises: Promise<void>[] = [];

    for (const imageUrl of product.imagenes) {
      if (imageUrl && imageUrl.includes("firebasestorage")) {
        try {
          const imageRef = ref(storage, imageUrl);
          deletePromises.push(deleteObject(imageRef).catch(e => console.warn(`No se pudo eliminar ${imageUrl}:`, e)));
        } catch (e) {
          console.warn(`Error con imagen ${imageUrl}:`, e);
        }
      }
    }

    if (product.variantes) {
      for (const variante of product.variantes) {
        if (variante.imagenes && Array.isArray(variante.imagenes)) {
          for (const imageUrl of variante.imagenes) {
            if (imageUrl && imageUrl.includes("firebasestorage")) {
              try {
                const imageRef = ref(storage, imageUrl);
                deletePromises.push(deleteObject(imageRef).catch(e => console.warn(`No se pudo eliminar imagen de color:`, e)));
              } catch (e) {
                console.warn(`Error con imagen de color ${imageUrl}:`, e);
              }
            }
          }
        }
        if (variante.imagen && variante.imagen.includes("firebasestorage")) {
          try {
            const imageRef = ref(storage, variante.imagen);
            deletePromises.push(deleteObject(imageRef).catch(e => console.warn(`No se pudo eliminar imagen de color:`, e)));
          } catch (e) {
            console.warn(`Error con imagen de color ${variante.imagen}:`, e);
          }
        }
      }
    }

    await Promise.all(deletePromises);
  };

  const cleanConfigReferences = async (productId: string) => {
    try {
      const masVendidosRef = doc(db, "configuracion", "masVendidos");
      await updateDoc(masVendidosRef, {
        productos: arrayRemove(productId)
      }).catch(() => {});

      const ofertasRef = doc(db, "configuracion", "ofertas");
      const ofertasDoc = await getDocs(collection(db, "configuracion"));
      const ofertasData = ofertasDoc.docs.find(d => d.id === "ofertas");
      if (ofertasData?.exists()) {
        const ofertas = ofertasData.data();
        if (ofertas[productId]) {
          const newOfertas = { ...ofertas };
          delete newOfertas[productId];
          await updateDoc(ofertasRef, newOfertas);
        }
      }

      const nuevosRef = doc(db, "configuracion", "nuevos");
      const nuevosDoc = await getDocs(collection(db, "configuracion"));
      const nuevosData = nuevosDoc.docs.find(d => d.id === "nuevos");
      if (nuevosData?.exists()) {
        const nuevos = nuevosData.data();
        const productosNuevos = nuevos.productos || {};
        if (productosNuevos[productId]) {
          const newProductosNuevos = { ...productosNuevos };
          delete newProductosNuevos[productId];
          await updateDoc(nuevosRef, { productos: newProductosNuevos });
        }
      }

      console.log(`✅ Referencias de producto ${productId} limpiadas`);
    } catch (error) {
      console.warn(`Error limpiando referencias de ${productId}:`, error);
    }
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`¿Eliminar "${product.nombre}"? Se borrarán también sus imágenes.`)) return;

    setDeleting(product.id);
    try {
      await deleteProductImages(product);
      await cleanConfigReferences(product.id);
      await deleteDoc(doc(db, "productos", product.id));
      setProducts(prev => prev.filter(p => p.id !== product.id));
      console.log(`✅ Producto ${product.nombre} eliminado completamente`);
    } catch (error) {
      console.error("Error eliminando producto:", error);
      alert("Error al eliminar el producto. Las imágenes pueden quedar huérfanas.");
    }
    setDeleting(null);
  };

  if (!user || !isAdmin) return <Navigate to="/admin" replace />;

  const stats = [
    { label: t("admin.stats.total", lang), value: products.length },
    { label: t("admin.stats.featured", lang), value: products.filter(p => p.masVendido).length },
    { label: t("admin.stats.new", lang), value: products.filter(p => p.nuevo).length },
    { label: t("admin.stats.sale", lang), value: products.filter(p => p.rebaja).length },
  ];

  const menuItems = [
    { to: "/admin/producto/nuevo", icon: Plus, label: t("admin.menu.new_product", lang) },
    { to: "/admin/masvendidos", icon: Star, label: t("admin.menu.featured", lang) },
    { to: "/admin/ofertas", icon: Percent, label: t("admin.menu.sales", lang) },
    { to: "/admin/nuevos", icon: Sparkles, label: t("admin.menu.new_arrivals", lang) },
    { to: "/admin/categorias", icon: FolderOpen, label: t("admin.menu.categories", lang) },
    { to: "/admin/shipping", icon: Truck, label: t("admin.menu.shipping", lang) },
    { to: "/admin/info-line", icon: MessageSquare, label: t("admin.menu.info_line", lang) },
    { to: "/admin/horario", icon: Clock, label: t("admin.menu.horario", lang) },
    { to: "/admin/change-password", icon: Shield, label: t("admin.menu.password", lang) },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <aside className={`fixed left-0 top-0 h-full bg-[#0a0a0a] border-r border-purple-900/30 z-50 transition-all duration-300 ${
        sidebarOpen ? 'w-64' : 'w-16'
      }`}>
        <div className="relative h-full flex flex-col">
          <div className="h-16 flex items-center justify-center border-b border-purple-900/30">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-purple-500/10 rounded-lg text-purple-500"
              title={sidebarOpen ? t("admin.sidebar.collapse", lang) : t("admin.sidebar.expand", lang)}
            >
              {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-4">
            {menuItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2 hover:bg-purple-500/5 transition-all ${
                  sidebarOpen ? 'justify-start' : 'justify-center'
                }`}
                title={!sidebarOpen ? item.label : ""}
              >
                <div className="w-6 h-6 bg-purple-500/10 rounded-lg flex items-center justify-center">
                  <item.icon size={14} className="text-purple-500" />
                </div>
                {sidebarOpen && (
                  <span className="text-sm text-gray-300 hover:text-white">
                    {item.label}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          <div className="p-3 border-t border-purple-900/30">
            <button
              onClick={handleLogoutAndGoHome}
              className={`flex items-center gap-3 w-full text-red-400 hover:bg-red-500/10 rounded-lg py-2 ${
                sidebarOpen ? 'px-3' : 'justify-center'
              }`}
              title={!sidebarOpen ? t("admin.logout", lang) : ""}
            >
              <div className="w-6 h-6 bg-red-500/10 rounded-lg flex items-center justify-center">
                <LogOut size={14} className="text-red-500" />
              </div>
              {sidebarOpen && <span className="text-sm">{t("admin.logout", lang)}</span>}
            </button>
          </div>
        </div>
      </aside>

      <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">{t("admin.title", lang)}</h1>
              <p className="text-sm text-gray-500 mt-1">
                {lang === 'es' && 'Español'}
                {lang === 'en' && 'English'}
                {lang === 'gr' && 'Ελληνικά'}
              </p>
            </div>
            
            <button
              onClick={handleLogoutAndGoHome}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-black font-medium rounded-lg hover:bg-purple-400 transition-all"
              title={t("admin.store", lang)}
            >
              <Home size={18} />
              <span>{t("admin.store", lang)}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-[#0a0a0a] p-4 rounded-xl border border-purple-900/30 hover:border-purple-500/50 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-white">{stat.value}</span>
                </div>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="bg-[#0a0a0a] rounded-xl border border-purple-900/30 p-4">
            <h2 className="text-lg font-semibold text-white mb-4">{t("admin.products.title", lang)}</h2>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input
                type="text"
                placeholder={t("admin.products.search", lang)}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black/50 border border-purple-900/30 rounded-lg pl-9 pr-4 py-2 text-white text-sm focus:border-purple-500/50"
              />
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs ${
                      selectedCategory === cat.id
                        ? 'bg-purple-500/20 text-purple-500 border border-purple-500/30'
                        : 'bg-black/30 text-gray-400 hover:text-white border border-purple-900/30'
                    }`}
                  >
                    <Icon size={12} />
                    <span>{cat.nombre}</span>
                    {selectedCategory === cat.id && (
                      <X size={12} className="ml-1 cursor-pointer" onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCategory("todos");
                      }} />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredProducts.slice(0, 10).map((p) => (
                <div key={p.id} className="flex items-center justify-between p-2 bg-black/30 rounded-lg border border-purple-900/30">
                  <div className="flex items-center gap-2">
                    {p.imagenes?.[0] && (
                      <img src={p.imagenes[0]} alt={p.nombre} className="w-8 h-8 object-cover rounded" />
                    )}
                    <div>
                      <p className="text-white text-sm">{p.nombre}</p>
                      <p className="text-purple-500 text-xs">{p.precio}€</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Link to={`/admin/producto/${p.id}`} className="p-1 text-gray-400 hover:text-purple-500">
                      <Pencil size={14} />
                    </Link>
                    <button 
                      onClick={() => handleDelete(p)} 
                      disabled={deleting === p.id}
                      className="p-1 text-gray-400 hover:text-red-500 disabled:opacity-50"
                    >
                      {deleting === p.id ? (
                        <div className="w-3 h-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;