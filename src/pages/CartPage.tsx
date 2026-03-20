import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, CreditCard, Truck, Shield } from "lucide-react";

const CartPage = () => {
  const { items, removeItem, updateQuantity, totalItems, totalPrice, clearCart } = useCart();
  const { lang } = useLanguage();

  const getText = (es: string, en: string, gr: string) => {
    if (lang === 'en') return en;
    if (lang === 'gr') return gr;
    return es;
  };

  const getProductName = (item: any) => {
    if (lang === 'en' && item.nombre_en) return item.nombre_en;
    if (lang === 'gr' && item.nombre_gr) return item.nombre_gr;
    return item.nombre;
  };

  const shippingCost = totalPrice >= 50 ? 0 : 5.99;
  const finalTotal = totalPrice + shippingCost;

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-32 pb-16 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-16 bg-[#0a0a0a]/50 rounded-2xl border border-green-900/30 backdrop-blur-sm">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag size={32} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {getText("Tu carrito está vacío", "Your cart is empty", "Το καλάθι σας είναι άδειο")}
            </h2>
            <p className="text-gray-400 mb-6">
              {getText("Parece que aún no has añadido ningún producto", "You haven't added any products yet", "Δεν έχετε προσθέσει ακόμα κανένα προϊόν")}
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-green-500 text-black px-6 py-3 rounded-xl font-medium hover:bg-green-400 transition-all"
            >
              <ArrowLeft size={18} />
              {getText("Seguir comprando", "Continue shopping", "Συνέχεια αγορών")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-16 bg-gradient-to-b from-black to-gray-900">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            {getText("Mi Carrito", "My Cart", "Το Καλάθι μου")}
            <span className="text-green-500 text-lg ml-2">({totalItems} {getText("productos", "items", "προϊόντα")})</span>
          </h1>
          <Link
            to="/"
            className="text-gray-400 hover:text-green-500 transition-colors flex items-center gap-2 text-sm"
          >
            <ArrowLeft size={16} />
            {getText("Seguir comprando", "Continue shopping", "Συνέχεια αγορών")}
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de productos - VERSIÓN COMPACTA */}
          <div className="lg:col-span-2">
            <div className="bg-[#0a0a0a] rounded-2xl border border-green-900/30 overflow-hidden">
              {/* Cabecera de la tabla - oculta en móvil */}
              <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-black/50 border-b border-green-900/30 text-sm text-gray-500">
                <div className="col-span-6">Producto</div>
                <div className="col-span-2 text-center">Precio</div>
                <div className="col-span-2 text-center">Cantidad</div>
                <div className="col-span-1 text-center">Total</div>
                <div className="col-span-1"></div>
              </div>

              {/* Items del carrito */}
              <div className="divide-y divide-green-900/20">
                {items.map((item) => {
                  const productName = getProductName(item);
                  const itemTotal = item.precio * item.cantidad;
                  
                  return (
                    <div key={item.id} className="p-4 hover:bg-green-500/5 transition-colors">
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        {/* Imagen y nombre */}
                        <div className="flex items-center gap-4 md:w-2/5">
                          <Link to={`/producto/${item.id}`} className="flex-shrink-0">
                            <img
                              src={item.imagen}
                              alt={productName}
                              className="w-16 h-16 object-cover rounded-xl bg-gray-800 border border-green-900/30"
                              onError={(e) => {
                                e.currentTarget.src = `https://placehold.co/100x100/2a2a2a/2ecc71?text=${encodeURIComponent(productName.substring(0, 3))}`;
                              }}
                            />
                          </Link>
                          <Link to={`/producto/${item.id}`} className="hover:text-green-500 transition-colors">
                            <h3 className="font-medium text-white text-sm md:text-base line-clamp-2">
                              {productName}
                            </h3>
                          </Link>
                        </div>

                        {/* Precio unitario */}
                        <div className="md:w-1/6">
                          <p className="text-green-500 font-semibold text-sm md:text-base">
                            {item.precio.toFixed(2)}€
                          </p>
                        </div>

                        {/* Cantidad con controles */}
                        <div className="md:w-1/6">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                              className="w-7 h-7 rounded-lg bg-black/50 border border-green-900/30 text-white hover:bg-green-500/20 hover:border-green-500/50 transition-all flex items-center justify-center"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="text-white font-medium w-8 text-center text-sm">
                              {item.cantidad}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                              className="w-7 h-7 rounded-lg bg-black/50 border border-green-900/30 text-white hover:bg-green-500/20 hover:border-green-500/50 transition-all flex items-center justify-center"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>

                        {/* Total por producto */}
                        <div className="md:w-1/6">
                          <p className="text-white font-semibold text-sm md:text-base">
                            {itemTotal.toFixed(2)}€
                          </p>
                        </div>

                        {/* Eliminar */}
                        <div className="md:w-1/12 flex justify-end">
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                            title={getText("Eliminar", "Remove", "Αφαίρεση")}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer del carrito */}
              <div className="p-4 bg-black/30 border-t border-green-900/30 flex justify-between items-center">
                <button
                  onClick={clearCart}
                  className="text-gray-500 hover:text-red-500 text-sm flex items-center gap-2 transition-colors"
                >
                  <Trash2 size={14} />
                  {getText("Vaciar carrito", "Clear cart", "Άδειασμα καλαθιού")}
                </button>
                <Link
                  to="/"
                  className="text-green-500 hover:text-green-400 text-sm flex items-center gap-2 transition-colors"
                >
                  <ShoppingBag size={14} />
                  {getText("Seguir comprando", "Continue shopping", "Συνέχεια αγορών")}
                </Link>
              </div>
            </div>
          </div>

          {/* Resumen del pedido - PROFESIONAL */}
          <div className="lg:col-span-1">
            <div className="bg-[#0a0a0a] rounded-2xl border border-green-900/30 p-6 sticky top-32">
              <h2 className="text-lg font-bold text-white mb-4">
                {getText("Resumen del pedido", "Order summary", "Σύνοψη παραγγελίας")}
              </h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-400 text-sm">
                  <span>{getText("Subtotal", "Subtotal", "Υποσύνολο")}</span>
                  <span className="text-white">{totalPrice.toFixed(2)}€</span>
                </div>
                
                <div className="flex justify-between text-gray-400 text-sm">
                  <span className="flex items-center gap-1">
                    <Truck size={14} />
                    {getText("Envío", "Shipping", "Αποστολή")}
                  </span>
                  {shippingCost === 0 ? (
                    <span className="text-green-500 font-medium">
                      {getText("Gratis", "Free", "Δωρεάν")}
                    </span>
                  ) : (
                    <span className="text-white">{shippingCost.toFixed(2)}€</span>
                  )}
                </div>
                
                {totalPrice > 0 && totalPrice < 50 && (
                  <div className="bg-yellow-500/10 rounded-xl p-3 border border-yellow-500/20">
                    <p className="text-yellow-500 text-xs text-center">
                      {getText(
                        `Añade ${(50 - totalPrice).toFixed(2)}€ más para envío gratis`,
                        `Add ${(50 - totalPrice).toFixed(2)}€ more for free shipping`,
                        `Προσθέστε ${(50 - totalPrice).toFixed(2)}€ ακόμα για δωρεάν αποστολή`
                      )}
                    </p>
                  </div>
                )}
                
                <div className="border-t border-green-900/30 pt-3 flex justify-between font-bold">
                  <span className="text-white">{getText("Total", "Total", "Σύνολο")}</span>
                  <span className="text-green-500 text-xl">{finalTotal.toFixed(2)}€</span>
                </div>
              </div>

              {/* Botón de compra */}
              <button className="w-full bg-green-500 text-black font-bold py-3 rounded-xl hover:bg-green-400 transition-all flex items-center justify-center gap-2 mb-4">
                <CreditCard size={18} />
                {getText("FINALIZAR COMPRA", "CHECKOUT", "ΟΛΟΚΛΗΡΩΣΗ ΑΓΟΡΑΣ")}
              </button>

              {/* Métodos de pago */}
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-2">
                  {getText("Aceptamos", "We accept", "Δεχόμαστε")}
                </p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-xs bg-gray-800 px-2 py-1 rounded">💳 Visa</span>
                  <span className="text-xs bg-gray-800 px-2 py-1 rounded">💳 Mastercard</span>
                  <span className="text-xs bg-gray-800 px-2 py-1 rounded">💰 Bizum</span>
                  <span className="text-xs bg-gray-800 px-2 py-1 rounded">📱 PayPal</span>
                </div>
              </div>

              {/* Garantía */}
              <div className="mt-4 pt-4 border-t border-green-900/30 flex items-center justify-center gap-2 text-xs text-gray-500">
                <Shield size={12} />
                <span>{getText("Compra segura", "Secure checkout", "Ασφαλής αγορά")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;