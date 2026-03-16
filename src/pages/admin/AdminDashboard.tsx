import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Navigate, Link, useNavigate } from "react-router-dom";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { 
  LayoutDashboard, Package, Plus, Pencil, Trash2, LogOut,
  TrendingUp, Sparkles, Tag, Star, Percent, FolderOpen,
  Settings, Search, Baby, Bike, Car, Zap, Wrench, X, Truck,
  Info, Palette, Languages, ArrowLeftRight, MessageSquare,
  ShoppingBag, Users, BarChart, Shield, Globe, CreditCard,
  Gift, Award, Clock, Bell, Download, Upload, RefreshCw,
  Home, Box, TagIcon, PercentCircle, Settings as SettingsIcon,
  HelpCircle, LogOutIcon, Grid, Layers, Wind, Gauge,
  Menu, ChevronLeft, ChevronRight, User, Lock, Mail
} from "lucide-react";

interface Product {
  id: string;
  nombre: string;
  precio: number;
  categoria: string;
  imagenes: string[];
  masVendido?: boolean;
  nuevo?: boolean;
  rebaja?: boolean;
}

const AdminDashboard = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("todos");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Categorías con traducción
  const categories = [
    { id: "todos", nombre: t("admin.categories.all") || "Todos los productos", icon: Package },
    { id: "patinetes", nombre: t("admin.categories.scooters") || "Patinetes Eléctricos", icon: Zap },
    { id: "bicicletas", nombre: t("admin.categories.bikes") || "Bicicletas Eléctricas", icon: Bike },
    { id: "motos", nombre: t("admin.categories.motorcycles") || "Motos Eléctricas", icon: Car },
    { id: "accesorios", nombre: t("admin.categories.accessories") || "Accesorios y Repuestos", icon: Wrench },
    { id: "piezas", nombre: t("admin.categories.spareparts") || "Piezas de Repuesto", icon: Settings },
    { id: "infantiles", nombre: t("admin.categories.kids") || "Línea Infantil", icon: Baby },
    { id: "movilidad", nombre: t("admin.categories.mobility") || "Movilidad Reducida", icon: Wind },
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
          rebaja: data.rebaja === true
        } as Product;
      });
      setProducts(loadedProducts);
      setFilteredProducts(loadedProducts);
    } catch (error) {
      console.error("Error cargando productos:", error);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("messages.confirm_delete") || "¿Estás seguro de que quieres eliminar este producto?")) return;
    
    setDeleting(id);
    try {
      await deleteDoc(doc(db, "productos", id));
      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      console.error("Error eliminando producto:", error);
      alert(t("messages.error") || "Error al eliminar el producto");
    }
    setDeleting(null);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/admin");
  };

  if (!user || !isAdmin) return <Navigate to="/admin" replace />;

  // Estadísticas con traducción
  const stats = [
    { 
      label: t("admin.total_products") || "Total Productos", 
      value: products.length, 
      icon: Package, 
      change: "+12%",
      period: t("admin.stats.last_month") || "último mes"
    },
    { 
      label: t("admin.best_sellers") || "Productos Destacados", 
      value: products.filter(p => p.masVendido).length, 
      icon: Star, 
      change: "+5%",
      period: t("admin.stats.last_week") || "última semana"
    },
    { 
      label: t("admin.new_products") || "Nuevos Ingresos", 
      value: products.filter(p => p.nuevo).length, 
      icon: Sparkles, 
      change: "+8%",
      period: t("admin.stats.this_month") || "este mes"
    },
    { 
      label: t("admin.on_sale") || "Ofertas Activas", 
      value: products.filter(p => p.rebaja).length, 
      icon: Tag, 
      change: "-2%",
      period: t("admin.stats.yesterday") || "respecto ayer"
    },
  ];

  // 🎯 MENÚ COMPLETAMENTE TRADUCIDO
  const menuAreas = [
    {
      id: "productos",
      titulo: t("admin.menu.products_title") || "📋 MENÚ ADMIN - EDICIÓN DE PRODUCTOS",
      descripcion: t("admin.menu.products_desc") || "Gestiona todo el catálogo de productos",
      icon: ShoppingBag,
      items: [
        { 
          to: "/admin/producto/nuevo", 
          icon: Plus, 
          label: t("admin.menu.add_product") || "➕ AGREGAR NUEVO PRODUCTO", 
          desc: t("admin.menu.add_product_desc") || "Crear y publicar un producto en la tienda",
          badge: t("admin.new") || "Nuevo"
        },
        { 
          to: "/admin/masvendidos", 
          icon: Star, 
          label: t("admin.menu.best_sellers") || "⭐ PRODUCTOS MÁS VENDIDOS", 
          desc: t("admin.menu.best_sellers_desc") || "Seleccionar los productos más populares"
        },
        { 
          to: "/admin/ofertas", 
          icon: Percent, 
          label: t("admin.menu.on_sale") || "🏷️ PRODUCTOS EN OFERTA", 
          desc: t("admin.menu.on_sale_desc") || "Gestionar descuentos y promociones"
        },
      ]
    },
    {
      id: "categorias",
      titulo: t("admin.menu.categories_title") || "📁 ORGANIZACIÓN DEL CATÁLOGO",
      descripcion: t("admin.menu.categories_desc") || "Clasifica y ordena los productos",
      icon: FolderOpen,
      items: [
        { 
          to: "/admin/categorias", 
          icon: FolderOpen, 
          label: t("admin.menu.edit_categories") || "📑 EDITAR CATEGORÍAS", 
          desc: t("admin.menu.edit_categories_desc") || "Renombrar, ordenar y activar categorías"
        },
      ]
    },
    {
      id: "configuracion",
      titulo: t("admin.menu.settings_title") || "⚙️ CONFIGURACIÓN DE LA TIENDA",
      descripcion: t("admin.menu.settings_desc") || "Ajustes generales de la web",
      icon: Settings,
      items: [
        { 
          to: "/admin/shipping", 
          icon: Truck, 
          label: t("admin.menu.shipping") || "🚚 CONFIGURAR ENVÍOS", 
          desc: t("admin.menu.shipping_desc") || "Gastos de envío y envío gratis"
        },
        { 
          to: "/admin/info-line", 
          icon: MessageSquare, 
          label: t("admin.menu.info_line") || "📢 LÍNEA INFORMATIVA ANIMADA", 
          desc: t("admin.menu.info_line_desc") || "Mensaje rotativo en 3 idiomas",
          badge: t("admin.new") || "Nuevo"
        },
      ]
    },
    {
      id: "seguridad",
      titulo: t("admin.menu.security_title") || "🔐 SEGURIDAD DE LA CUENTA",
      descripcion: t("admin.menu.security_desc") || "Protege tu acceso al panel",
      icon: Shield,
      items: [
        { 
          to: "/admin/change-password", 
          icon: Shield, 
          label: t("admin.menu.change_password") || "🔒 CAMBIAR CONTRASEÑA", 
          desc: t("admin.menu.change_password_desc") || "Actualiza tu clave de acceso"
        },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Sidebar - Negro con bordes verdes sutiles */}
      <aside className={`fixed left-0 top-0 h-full bg-[#0a0a0a] border-r border-green-900/30 z-50 transition-all duration-300 ${
        sidebarOpen ? 'w-72' : 'w-20'
      }`}>
        <div className="relative h-full flex flex-col">
          {/* Logo y toggle con efecto verde */}
          <div className="h-20 flex items-center justify-between px-4 border-b border-green-900/30">
            {sidebarOpen ? (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                  <Shield size={18} className="text-green-500" />
                </div>
                <span className="font-display font-bold text-white text-lg">Admin Pro</span>
              </div>
            ) : (
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                <Shield size={18} className="text-green-500" />
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 hover:bg-green-500/10 rounded-lg transition-colors text-green-500"
            >
              {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
            </button>
          </div>

          {/* Info del usuario */}
          <div className="p-4 border-b border-green-900/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                <User size={20} className="text-green-500" />
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {user?.email?.split('@')[0]}
                  </p>
                  <p className="text-gray-600 text-xs truncate">
                    {user?.email}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Menú de navegación */}
          <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-6">
            {menuAreas.map((area) => (
              <div key={area.id} className="space-y-2">
                {sidebarOpen && (
                  <div className="px-3 mb-2">
                    <p className="text-xs font-medium text-green-500/70 tracking-wider">
                      {area.titulo}
                    </p>
                  </div>
                )}
                {area.items.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group hover:bg-green-500/5"
                  >
                    <div className="p-2 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-all shadow-[0_0_10px_rgba(34,197,94,0.1)] group-hover:shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                      <item.icon size={16} className="text-green-500" />
                    </div>
                    {sidebarOpen && (
                      <>
                        <span className="flex-1 text-sm text-gray-300 group-hover:text-white">
                          {item.label}
                        </span>
                        {item.badge && (
                          <span className="px-2 py-0.5 bg-green-500/20 text-green-500 text-[9px] rounded-full border border-green-500/30">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                ))}
              </div>
            ))}
          </nav>

          {/* Botón de logout */}
          <div className="p-4 border-t border-green-900/30">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-red-400 hover:bg-red-500/10 rounded-xl transition-all group"
            >
              <div className="p-2 bg-red-500/10 rounded-lg group-hover:bg-red-500/20 transition-colors">
                <LogOut size={16} className="text-red-500" />
              </div>
              {sidebarOpen && (
                <span className="text-sm text-gray-300 group-hover:text-white">{t("admin.logout") || "Cerrar Sesión"}</span>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-72' : 'ml-20'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* HEADER */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold text-white">
                {t("admin.dashboard") || "Panel de Control"}
              </h1>
              <p className="text-gray-500 mt-1 flex items-center gap-2">
                <Globe size={14} className="text-green-500" />
                {t("admin.dashboard_subtitle") || "Gestión profesional de tu tienda"}
                <span className="text-green-500 text-xs bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                  {lang === 'es' ? '🇪🇸 Español' : lang === 'en' ? '🇬🇧 English' : '🇬🇷 Ελληνικά'}
                </span>
              </p>
            </div>

            {/* BOTÓN HOME */}
            <Link
              to="/"
              className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500/10 text-green-500 rounded-xl hover:bg-green-500/20 transition-all shadow-[0_0_10px_rgba(34,197,94,0.1)] hover:shadow-[0_0_15px_rgba(34,197,94,0.3)]"
              title={t("admin.view_store") || "Ir a la tienda"}
            >
              <Home size={18} />
              <span className="hidden sm:inline">{t("admin.view_store") || "Ver Tienda"}</span>
              <span className="sm:hidden">{t("admin.store") || "Tienda"}</span>
            </Link>
          </div>

          {/* Stats Cards - Negro con sombras verdes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="bg-[#0a0a0a] rounded-2xl p-6 border border-green-900/30 hover:border-green-500/50 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:shadow-[0_0_25px_rgba(34,197,94,0.2)]"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-green-500/10 rounded-xl shadow-[0_0_10px_rgba(34,197,94,0.1)]">
                      <Icon size={24} className="text-green-500" />
                    </div>
                    <span className="text-3xl font-bold text-white">{stat.value}</span>
                  </div>
                  <p className="text-gray-400 text-sm font-medium mb-1">{stat.label}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-green-500">{stat.change}</span>
                    <span className="text-xs text-gray-600">{stat.period}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Áreas del panel - Negro con sombras verdes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {menuAreas.map((area) => (
              <div
                key={area.id}
                className="bg-[#0a0a0a] rounded-2xl border border-green-900/30 overflow-hidden hover:border-green-500/50 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:shadow-[0_0_25px_rgba(34,197,94,0.2)]"
              >
                <div className="bg-green-500/5 p-4 border-b border-green-900/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded-lg shadow-[0_0_10px_rgba(34,197,94,0.1)]">
                      <area.icon size={20} className="text-green-500" />
                    </div>
                    <h2 className="font-display font-bold text-white text-lg">{area.titulo}</h2>
                  </div>
                  <p className="text-gray-500 text-xs mt-1 ml-12">{area.descripcion}</p>
                </div>
                <div className="p-4 space-y-3">
                  {area.items.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="flex items-start gap-4 p-4 rounded-xl bg-black/50 hover:bg-green-500/5 transition-all group border border-green-900/20 hover:border-green-500/30"
                    >
                      <div className="p-3 bg-green-500/10 rounded-xl group-hover:bg-green-500/20 transition-all shadow-[0_0_10px_rgba(34,197,94,0.1)] group-hover:shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                        <item.icon size={18} className="text-green-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-display text-base text-white group-hover:text-green-500 transition-colors">
                            {item.label}
                          </p>
                          {item.badge && (
                            <span className="px-2 py-0.5 bg-green-500/20 text-green-500 text-[10px] rounded-full border border-green-500/30">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600">{item.desc}</p>
                        {item.to === "/admin/info-line" && (
                          <div className="flex gap-2 mt-2">
                            <span className="text-[9px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full border border-green-500/20">🇪🇸 ES</span>
                            <span className="text-[9px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full border border-green-500/20">🇬🇧 EN</span>
                            <span className="text-[9px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full border border-green-500/20">🇬🇷 GR</span>
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Sección de productos recientes */}
          <div className="bg-[#0a0a0a] rounded-2xl border border-green-900/30 p-6 hover:border-green-500/50 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:shadow-[0_0_25px_rgba(34,197,94,0.2)]">
            <h2 className="text-xl font-display font-semibold text-white mb-4 flex items-center gap-2">
              <Package size={20} className="text-green-500" />
              {t("admin.recent_products") || "Últimos Productos"}
            </h2>
            {/* Aquí puedes poner la lista de productos si quieres */}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;