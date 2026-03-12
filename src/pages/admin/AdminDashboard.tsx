import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Navigate, Link } from "react-router-dom";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { 
  LayoutDashboard, Package, Plus, Pencil, Trash2, LogOut,
  TrendingUp, Sparkles, Tag, Star, Percent, FolderOpen,
  Settings, Search, Baby, Bike, Car, Zap, Wrench, X
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
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("todos");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const categories = [
    { id: "todos", nombre: "Todos", icon: Package },
    { id: "patinetes", nombre: "Patinetes", icon: Zap },
    { id: "bicicletas", nombre: "Bicicletas", icon: Bike },
    { id: "motos", nombre: "Motos", icon: Car },
    { id: "accesorios", nombre: "Accesorios", icon: Wrench },
    { id: "piezas", nombre: "Piezas", icon: Settings },
    { id: "infantiles", nombre: "Infantiles", icon: Baby },
  ];

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    let filtered = products;

    // Filtrar por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.nombre.toLowerCase().includes(term) ||
        p.categoria.toLowerCase().includes(term) ||
        p.precio.toString().includes(term)
      );
    }

    // Filtrar por categoría
    if (selectedCategory !== "todos") {
      filtered = filtered.filter(p => p.categoria === selectedCategory);
    }

    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, products]);

  const loadProducts = async () => {
    setLoading(true);
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
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este producto?")) return;
    
    setDeleting(id);
    try {
      await deleteDoc(doc(db, "productos", id));
      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      console.error("Error eliminando producto:", error);
      alert("Error al eliminar el producto");
    }
    setDeleting(null);
  };

  if (!user || !isAdmin) return <Navigate to="/admin" replace />;

  const stats = [
    { label: "Total Productos", value: products.length, icon: Package, color: "text-blue-500" },
    { label: "Más Vendidos", value: products.filter(p => p.masVendido).length, icon: TrendingUp, color: "text-yellow-500" },
    { label: "Productos Nuevos", value: products.filter(p => p.nuevo).length, icon: Sparkles, color: "text-green-500" },
    { label: "En Oferta", value: products.filter(p => p.rebaja).length, icon: Tag, color: "text-red-500" },
  ];

  const menuSections = [
    {
      title: "PRODUCTOS",
      items: [
        { to: "/admin/producto/nuevo", icon: Plus, label: "Añadir Producto", desc: "Crear nuevo producto" },
        { to: "/admin/masvendidos", icon: Star, label: "Más Vendidos", desc: "Gestionar destacados" },
        { to: "/admin/ofertas", icon: Percent, label: "Ofertas", desc: "Productos en oferta" },
      ]
    },
    {
      title: "CATEGORÍAS",
      items: [
        { to: "/admin/categorias", icon: FolderOpen, label: "Gestionar Categorías", desc: "Editar nombres y orden" },
      ]
    }
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        {/* Cabecera */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <LayoutDashboard size={32} className="text-primary" />
            <div>
              <h1 className="font-display font-bold text-3xl tracking-tight text-foreground">
                Panel de Administración
              </h1>
              <p className="text-muted-foreground mt-1">
                Gestiona todos los aspectos de tu tienda
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-destructive hover:text-destructive-foreground transition-colors"
          >
            <LogOut size={16} />
            Cerrar Sesión
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="p-6 rounded-xl bg-card glow-border hover:border-primary/30 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-primary/10 ${color}`}>
                  <Icon size={24} className="text-primary" />
                </div>
                <span className="text-3xl font-bold text-foreground">{value}</span>
              </div>
              <p className="text-muted-foreground text-sm">{label}</p>
            </div>
          ))}
        </div>

        {/* Menú de navegación */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
          {/* Accesos rápidos */}
          <div className="lg:col-span-1 space-y-4">
            {menuSections.map((section) => (
              <div key={section.title} className="bg-card rounded-xl p-4 glow-border">
                <h3 className="font-display font-bold text-sm text-primary mb-3 tracking-wider">
                  {section.title}
                </h3>
                <div className="space-y-2">
                  {section.items.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors group"
                    >
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <item.icon size={16} className="text-primary" />
                      </div>
                      <div>
                        <p className="font-display text-sm text-foreground">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Lista de productos */}
          <div className="lg:col-span-3">
            <div className="bg-card rounded-xl p-6 glow-border">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <h2 className="font-display font-bold text-xl text-foreground">
                  Productos {filteredProducts.length > 0 && `(${filteredProducts.length})`}
                </h2>
                <Link
                  to="/admin/producto/nuevo"
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-glow transition-colors whitespace-nowrap"
                >
                  <Plus size={16} />
                  Nuevo Producto
                </Link>
              </div>

              {/* Buscador y filtros */}
              <div className="space-y-4 mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <input
                    type="text"
                    placeholder="Buscar productos por nombre, categoría o precio..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-lg pl-10 pr-4 py-3 text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
                  />
                </div>

                {/* Filtros por categoría */}
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                        selectedCategory === cat.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <cat.icon size={14} />
                      <span className="text-sm">{cat.nombre}</span>
                      {selectedCategory === cat.id && (
                        <X 
                          size={14} 
                          className="ml-1 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCategory("todos");
                          }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lista de productos */}
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Cargando productos...</p>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <Package size={48} className="text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground text-lg">
                      {searchTerm || selectedCategory !== "todos" 
                        ? "No se encontraron productos" 
                        : "No hay productos disponibles"}
                    </p>
                  </div>
                ) : (
                  filteredProducts.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-4 p-4 rounded-xl bg-secondary border border-border hover:border-primary/30 transition-all"
                    >
                      {p.imagenes?.[0] ? (
                        <img 
                          src={p.imagenes[0]} 
                          alt={p.nombre} 
                          className="w-16 h-16 object-cover rounded-lg"
                          onError={(e) => {
                            e.currentTarget.src = "https://placehold.co/400/2a2a2a/2ecc71?text=Sin+imagen";
                          }}
                        />
                      ) : (
                        <div className="w-16 h-16 bg-background rounded-lg flex items-center justify-center">
                          <Package size={24} className="text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-display text-sm text-foreground truncate">{p.nombre}</p>
                          <div className="flex gap-1">
                            {p.masVendido && (
                              <span className="bg-yellow-500/10 text-yellow-500 text-[10px] px-2 py-0.5 rounded-full">
                                Top
                              </span>
                            )}
                            {p.nuevo && (
                              <span className="bg-green-500/10 text-green-500 text-[10px] px-2 py-0.5 rounded-full">
                                Nuevo
                              </span>
                            )}
                            {p.rebaja && (
                              <span className="bg-red-500/10 text-red-500 text-[10px] px-2 py-0.5 rounded-full">
                                Oferta
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <p className="text-primary font-bold">{p.precio}€</p>
                          <p className="text-muted-foreground">•</p>
                          <p className="text-muted-foreground capitalize">{p.categoria}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Link
                          to={`/admin/producto/${p.id}`}
                          className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-primary/10"
                          title="Editar producto"
                        >
                          <Pencil size={18} />
                        </Link>
                        <button
                          onClick={() => handleDelete(p.id)}
                          disabled={deleting === p.id}
                          className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10 disabled:opacity-50"
                          title="Eliminar producto"
                        >
                          {deleting === p.id ? (
                            <div className="w-4 h-4 border-2 border-destructive border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 size={18} />
                          )}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;