import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Navigate } from "react-router-dom";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Product {
  id: string;
  nombre: string;
  precio: number;
  categoria: string;
  imagenes: string[];
}

const AdminMasVendidos = () => {
  const { user, isAdmin } = useAuth();
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [masVendidos, setMasVendidos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const productSnap = await getDocs(collection(db, "productos"));
      setProducts(productSnap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));

      const configSnap = await getDocs(collection(db, "configuracion"));
      const config = configSnap.docs.find(d => d.id === "masVendidos");
      if (config?.exists()) {
        setMasVendidos(config.data().productos || []);
      }
    } catch (error) {
      console.error("Error cargando datos:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const toggleProduct = (productId: string) => {
    setMasVendidos(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "configuracion", "masVendidos"), {
        productos: masVendidos,
        updatedAt: new Date()
      });
      toast({
        title: "Éxito",
        description: "Productos más vendidos guardados correctamente",
      });
    } catch (error) {
      console.error("Error guardando:", error);
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios",
        variant: "destructive",
      });
    }
    setSaving(false);
  };

  if (!user || !isAdmin) return <Navigate to="/admin" replace />;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display font-bold text-2xl tracking-tight text-foreground">
            Productos Más Vendidos
          </h1>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-glow transition-colors"
          >
            <Save size={16} />
            {saving ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">Cargando...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  masVendidos.includes(product.id)
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-secondary hover:border-primary/50'
                }`}
                onClick={() => toggleProduct(product.id)}
              >
                <div className="flex gap-4">
                  {product.imagenes?.[0] && (
                    <img
                      src={product.imagenes[0]}
                      alt={product.nombre}
                      className="w-20 h-20 object-cover rounded"
                    />
                  )}
                  <div>
                    <h3 className="font-display font-bold text-foreground">{product.nombre}</h3>
                    <p className="text-primary font-bold">{product.precio}€</p>
                    <p className="text-sm text-muted-foreground capitalize">{product.categoria}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMasVendidos;