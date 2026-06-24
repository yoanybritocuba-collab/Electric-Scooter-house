import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import { 
  Trash2, Plus, Minus, ShoppingBag, ArrowLeft, 
  CreditCard, Truck, Shield, X, MessageCircle, Phone,
  AlertTriangle
} from "lucide-react";

const CartPage = () => {
  const { items, removeItem, updateQuantity, totalItems, totalPrice, clearCart } = useCart();
  const { lang } = useLanguage();
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

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

  // Función para obtener el código de color
  const getColorCode = (color: string): string => {
    const colorMap: Record<string, string> = {
      "Negro": "#000000",
      "Blanco": "#ffffff",
      "Rojo": "#ff0000",
      "Azul": "#0000ff",
      "Verde": "#00ff00",
      "Amarillo": "#ffff00",
      "Rosa": "#ff69b4",
      "Morado": "#800080",
      "Naranja": "#ffa500",
      "Gris": "#808080",
    };
    return colorMap[color] || "#888888";
  };

  // Función para obtener el ID único del carrito
  const getCartItemId = (item: any): string => {
    return item.variantId ? `${item.id}_${item.variantId}` : item.id;
  };

  // ========== FUNCIONES DEL MODAL ==========
  const viberNumber = "306993185757";
  const whatsappNumber = "306993185757";

  const handleViberContact = () => {
    window.open(`viber://contact?number=${viberNumber}`, '_blank');
    // Fallback si no tiene Viber
    setTimeout(() => {
      window.open(`https://msng.link/vi/${viberNumber}`, '_blank');
    }, 500);
  };

  const handleWhatsAppContact = () => {
    const message = encodeURIComponent(
      `Hola! Me interesa completar mi compra.\n\n📦 Productos: ${totalItems} artículos\n💰 Total: ${totalPrice.toFixed(2)}€\n\n¿Podrían ayudarme con el proceso de pago?`
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  const handleGoBack = () => {
    setShowCheckoutModal(false);
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
          {/* Lista de productos */}
          <div className="lg:col-span-2">
            <div className="bg-[#0a0a0a] rounded-2xl border border-green-900/30 overflow-hidden">
              {/* Cabecera de la tabla */}
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
                  const cartItemId = getCartItemId(item);
                  
                  return (
                    <div key={cartItemId} className="p-4 hover:bg-green-500/5 transition-colors">
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
                          <div className="flex-1">
                            <Link to={`/producto/${item.id}`} className="hover:text-green-500 transition-colors">
                              <h3 className="font-medium text-white text-sm md:text-base line-clamp-2">
                                {productName}
                              </h3>
                            </Link>
                            {item.color && (
                              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                <span 
                                  className="w-2 h-2 rounded-full" 
                                  style={{ backgroundColor: getColorCode(item.color) }}
                                />
                                {getText(item.color, item.color_en, item.color_gr)}
                              </p>
                            )}
                          </div>
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
                              onClick={() => updateQuantity(cartItemId, item.cantidad - 1)}
                              className="w-7 h-7 rounded-lg bg-black/50 border border-green-900/30 text-white hover:bg-green-500/20 hover:border-green-500/50 transition-all flex items-center justify-center"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="text-white font-medium w-8 text-center text-sm">
                              {item.cantidad}
                            </span>
                            <button
                              onClick={() => updateQuantity(cartItemId, item.cantidad + 1)}
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
                            onClick={() => removeItem(cartItemId)}
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

          {/* Resumen del pedido */}
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

              {/* ✅ BOTÓN MODIFICADO - Abre el modal en lugar de redirigir */}
              <button 
                onClick={() => setShowCheckoutModal(true)}
                className="w-full bg-green-500 text-black font-bold py-3 rounded-xl hover:bg-green-400 transition-all flex items-center justify-center gap-2 mb-4"
              >
                <CreditCard size={18} />
                {getText("FINALIZAR COMPRA", "CHECKOUT", "ΟΛΟΚΛΗΡΩΣΗ ΑΓΟΡΑΣ")}
              </button>

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

              <div className="mt-4 pt-4 border-t border-green-900/30 flex items-center justify-center gap-2 text-xs text-gray-500">
                <Shield size={12} />
                <span>{getText("Compra segura", "Secure checkout", "Ασφαλής αγορά")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========== MODAL DE "EN CONSTRUCCIÓN" ========== */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-gradient-to-b from-gray-900 to-black rounded-2xl border border-yellow-500/30 shadow-2xl shadow-yellow-500/10 overflow-hidden animate-scaleIn">
            {/* Botón cerrar */}
            <button
              onClick={() => setShowCheckoutModal(false)}
              className="absolute top-3 right-3 z-10 text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
            >
              <X size={20} />
            </button>

            {/* Header decorativo */}
            <div className="relative bg-gradient-to-r from-yellow-600/20 to-orange-600/20 p-6 text-center border-b border-yellow-500/20">
              <div className="flex justify-center mb-3">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-yellow-500/10 border-2 border-yellow-500/30 flex items-center justify-center animate-pulse">
                    <span className="text-4xl">🚧</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center animate-bounce">
                    <span className="text-xs text-black font-bold">!</span>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-yellow-400">
                {getText("En Construcción", "Under Construction", "Υπό Κατασκευή")}
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                {getText(
                  "Estamos mejorando nuestra pasarela de pagos",
                  "We are improving our payment gateway",
                  "Βελτιώνουμε την πύλη πληρωμών μας"
                )}
              </p>
            </div>

            {/* Cuerpo */}
            <div className="p-6 space-y-5">
              {/* Mensaje principal */}
              <div className="text-center">
                <p className="text-gray-300 text-sm leading-relaxed">
                  {getText(
                    "Para completar tu pedido de",
                    "To complete your order of",
                    "Για να ολοκληρώσετε την παραγγελία σας των"
                  )}{" "}
                  <span className="text-yellow-400 font-bold">{totalItems} {getText("artículos", "items", "αντικειμένων")}</span>
                  {" "}{getText("por un total de", "for a total of", "με συνολικό ποσό")}{" "}
                  <span className="text-green-400 font-bold">{finalTotal.toFixed(2)}€</span>,
                  <br />
                  {getText(
                    "contáctanos directamente por:",
                    "contact us directly through:",
                    "επικοινωνήστε μαζί μας απευθείας μέσω:"
                  )}
                </p>
              </div>

              {/* Botones de contacto */}
              <div className="space-y-3">
                <button
                  onClick={handleViberContact}
                  className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white rounded-xl font-semibold flex items-center justify-center gap-3 transition-all duration-300 shadow-lg hover:shadow-purple-500/30 group"
                >
                  <div className="relative">
                    <MessageCircle size={20} className="text-purple-200 group-hover:scale-110 transition-transform" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-ping" />
                  </div>
                  <span>{getText("Contactar por Viber", "Contact on Viber", "Επικοινωνία μέσω Viber")}</span>
                  <Phone size={16} className="opacity-60 group-hover:opacity-100 transition-opacity" />
                </button>

                <button
                  onClick={handleWhatsAppContact}
                  className="w-full py-3.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white rounded-xl font-semibold flex items-center justify-center gap-3 transition-all duration-300 shadow-lg hover:shadow-green-500/30 group"
                >
                  <div className="relative">
                    <MessageCircle size={20} className="text-green-200 group-hover:scale-110 transition-transform" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-ping" />
                  </div>
                  <span>{getText("Contactar por WhatsApp", "Contact on WhatsApp", "Επικοινωνία μέσω WhatsApp")}</span>
                  <Phone size={16} className="opacity-60 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>

              {/* Resumen rápido */}
              <div className="bg-black/30 rounded-xl p-4 border border-gray-700/30">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">{getText("Productos", "Items", "Προϊόντα")}:</span>
                  <span className="text-white">{totalItems}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-400">{getText("Total", "Total", "Σύνολο")}:</span>
                  <span className="text-green-400 font-bold">{finalTotal.toFixed(2)}€</span>
                </div>
              </div>

              {/* Botón volver al carrito */}
              <button
                onClick={handleGoBack}
                className="w-full py-3 bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 hover:text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors border border-gray-700/30"
              >
                <ArrowLeft size={16} />
                {getText("Volver al carrito", "Back to cart", "Επιστροφή στο καλάθι")}
              </button>

              {/* Mensaje de confianza */}
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span>{getText("Compra segura · Atención personalizada", "Secure purchase · Personalized attention", "Ασφαλής αγορά · Εξατομικευμένη προσοχή")}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Estilos para animaciones */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { 
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to { 
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default CartPage;