import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Navigate } from "react-router-dom";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { Save, Tag } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Product {
  id: string;
  nombre: string;
  precio: number;
  categoria: string;
  imagenes: string[];
}

const AdminOfertas = () => {
  const { user, isAdmin } = useAuth();
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [ofertas, setOfertas] = useState<Record<string, { activo: boolean; descuento: number }>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const productSnap = await getDocs(collection(db, "productos"));
      const productos = productSnap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
      setProducts(productos);

      const configSnap = await getDocs(collection(db, "configuracion"));
      const config = configSnap.docs.find(d => d.id === "ofertas");
      if (config?.exists()) {
        setOfertas(config.data().productos || {});
      } else {
        const initialOfertas: Record<string, { activo: boolean; descuento: number }> = {};
        productos.forEach(p => {
          initialOfertas[p.id] = { activo: false, descuento: 0 };
        });
        setOfertas(initialOfertas);
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

  const toggleOferta = (productId: string) => {
    setOfertas(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        activo: !prev[productId]?.activo
      }
    }));
  };

  const handleDescuentoChange = (productId: string, descuento: number) => {
    setOfertas(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        descuento: Math.min(100, Math.max(0, descuento))
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "configuracion", "ofertas"), {
        productos: ofertas,
        updatedAt: new Date()
      });
      toast({
        title: "Éxito",
        description: "Ofertas guardadas correctamente",
      });
    } catch (error) {
      console.error("Error guardando:", error);
      toast({
        title: "Error",
        description: "No se pudieron guardar las ofertas",
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
            Productos en Oferta
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
          <div className="space-y-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-secondary p-4 rounded-lg border border-border"
              >
                <div className="flex gap-4">
                  {product.imagenes?.[0] && (
                    <img
                      src={product.imagenes[0]}
                      alt={product.nombre}
                      className="w-20 h-20 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-display font-bold text-foreground">{product.nombre}</h3>
                        <p className="text-primary font-bold">{product.precio}€</p>
                        <p className="text-sm text-muted-foreground capitalize">{product.categoria}</p>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={ofertas[product.id]?.activo || false}
                          onChange={() => toggleOferta(product.id)}
                          className="accent-primary w-5 h-5"
                        />
                        <span className="text-sm">En oferta</span>
                      </label>
                    </div>

                    {ofertas[product.id]?.activo && (
                      <div className="mt-4 flex items-center gap-4">
                        <Tag size={16} className="text-primary" />
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Descuento:</span>
                          <input
                            type="number"
                            value={ofertas[product.id]?.descuento || 0}
                            onChange={(e) => handleDescuentoChange(product.id, parseInt(e.target.value) || 0)}
                            className="w-20 bg-background border border-border rounded px-2 py-1 text-foreground"
                            min="0"
                            max="100"
                          />
                          <span className="text-sm">%</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Precio final: {(product.precio * (1 - (ofertas[product.id]?.descuento || 0) / 100)).toFixed(2)}€
                        </div>
                      </div>
                    )}
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

export default AdminOfertas;