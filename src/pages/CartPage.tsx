import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";

interface ShippingConfig {
  freeShippingEnabled: boolean;
  freeShippingMinAmount: number;
  shippingCost: number;
}

const CartPage = () => {
  const { t, lang } = useLanguage();
  const { items, removeItem, updateQuantity, totalItems, totalPrice, clearCart } = useCart();
  const [shippingConfig, setShippingConfig] = useState<ShippingConfig>({
    freeShippingEnabled: true,
    freeShippingMinAmount: 50,
    shippingCost: 5
  });
  const [loading, setLoading] = useState(true);

  // Cargar configuración de envío
  useEffect(() => {
    const loadShippingConfig = async () => {
      try {
        const docRef = doc(db, "configuracion", "shipping");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setShippingConfig({
            freeShippingEnabled: data.freeShippingEnabled ?? true,
            freeShippingMinAmount: data.freeShippingMinAmount ?? 50,
            shippingCost: data.shippingCost ?? 5
          });
          console.log("✅ Configuración cargada:", data);
        } else {
          console.log("⚠️ Usando valores por defecto");
        }
      } catch (error) {
        console.error("Error cargando configuración de envío:", error);
      } finally {
        setLoading(false);
      }
    };
    loadShippingConfig();
  }, []);

  // Calcular costo de envío
  const shippingCost = shippingConfig.freeShippingEnabled && totalPrice >= shippingConfig.freeShippingMinAmount
    ? 0
    : shippingConfig.shippingCost;

  const finalTotal = totalPrice + shippingCost;

  // Función para obtener el nombre según el idioma
  const getNombre = (item: typeof items[0]): string => {
    if (lang === 'en' && item.nombre_en) return item.nombre_en;
    if (lang === 'gr' && item.nombre_gr) return item.nombre_gr;
    return item.nombre;
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag size={64} className="mx-auto mb-4 text-gray-600" />
          <h2 className="text-xl font-display font-bold text-white mb-2">
            {t("cart.empty_title") || "Carrito vacío"}
          </h2>
          <p className="text-gray-400 mb-6">
            {t("cart.empty_message") || "Añade algunos productos para comenzar"}
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-[#2ecc71] text-white px-6 py-3 rounded-lg hover:bg-[#27ae60] transition-colors"
          >
            <ArrowLeft size={18} />
            {t("cart.back_to_shop") || "Volver a la tienda"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-32 lg:pb-16">
      <div className="max-w-4xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display font-bold text-2xl text-white">
            {t("cart.title") || "Carrito"} ({totalItems})
          </h1>
          <button
            onClick={clearCart}
            className="text-sm text-gray-400 hover:text-red-500 transition-colors"
          >
            {t("cart.clear") || "Vaciar carrito"}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">Cargando...</div>
        ) : (
          <>
            <div className="space-y-4">
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex gap-4 bg-gray-900 rounded-lg p-4"
                >
                  <img
                    src={item.imagen}
                    alt={getNombre(item)}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  
                  <div className="flex-1">
                    <h3 className="font-display font-bold text-white mb-1">
                      {getNombre(item)}
                    </h3>
                    <p className="text-[#2ecc71] font-bold">{item.precio}€</p>
                    
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                          className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-white">{item.cantidad}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                          className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-500 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Resumen - CON ENVÍO DINÁMICO */}
            <div className="mt-8 bg-gray-900 rounded-lg p-6">
              <div className="flex justify-between text-lg mb-2">
                <span className="text-gray-400">{t("cart.subtotal") || "Subtotal"}:</span>
                <span className="text-white font-bold">{totalPrice.toFixed(2)}€</span>
              </div>
              
              <div className="flex justify-between text-lg mb-2">
                <span className="text-gray-400">{t("cart.shipping") || "Envío"}:</span>
                <span className={shippingCost === 0 ? "text-[#2ecc71] font-bold" : "text-white font-bold"}>
                  {shippingCost === 0 ? (t("cart.free") || "Gratis") : `${shippingCost.toFixed(2)}€`}
                </span>
              </div>

              {shippingConfig.freeShippingEnabled && shippingCost > 0 && (
                <div className="text-sm text-gray-500 mb-2">
                  {t("cart.free_shipping_note") || "Envío gratis a partir de"} {shippingConfig.freeShippingMinAmount}€
                </div>
              )}

              {shippingConfig.freeShippingEnabled && totalPrice < shippingConfig.freeShippingMinAmount && (
                <div className="text-sm text-yellow-500 mb-2">
                  ¡Te faltan {(shippingConfig.freeShippingMinAmount - totalPrice).toFixed(2)}€ para envío gratis!
                </div>
              )}

              <div className="border-t border-gray-700 pt-4 mb-6">
                <div className="flex justify-between text-xl">
                  <span className="text-white font-bold">{t("cart.total") || "Total"}:</span>
                  <span className="text-[#2ecc71] font-bold">{finalTotal.toFixed(2)}€</span>
                </div>
              </div>
              
              <button
                onClick={() => window.open(`https://wa.me/306993185757?text=${encodeURIComponent(
                  `${t("cart.whatsapp_message") || "Hola, quiero comprar estos productos"}:\\n${
                    items.map(i => `- ${getNombre(i)} x${i.cantidad} = ${i.precio * i.cantidad}€`).join('\\n')
                  }\\n${t("cart.subtotal") || "Subtotal"}: ${totalPrice}€\\n${
                    t("cart.shipping") || "Envío"
                  }: ${shippingCost === 0 ? (t("cart.free") || "Gratis") : shippingCost + '€'}\\n${
                    t("cart.total") || "Total"
                  }: ${finalTotal}€`
                )}`, '_blank')}
                className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <span>{t("cart.complete_purchase") || "Completar compra por WhatsApp"}</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartPage;