import React, { createContext, useContext, useState, useEffect } from "react";

interface CartItem {
  id: string;
  nombre: string;
  nombre_en?: string;
  nombre_gr?: string;
  precio: number;
  cantidad: number;
  imagen: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'cantidad'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, cantidad: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart debe usarse dentro de CartProvider");
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Cargar carrito desde localStorage al iniciar
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) {
          setItems(parsed);
          console.log("🛒 Carrito cargado desde localStorage:", parsed);
        }
      }
    } catch (error) {
      console.error("Error cargando carrito:", error);
    }
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(items));
      console.log("🛒 Carrito guardado en localStorage:", items);
    } catch (error) {
      console.error("Error guardando carrito:", error);
    }
  }, [items]);

  const addItem = (newItem: Omit<CartItem, 'cantidad'>) => {
    console.log("➕ Añadiendo al carrito:", newItem);
    
    setItems(prev => {
      const existing = prev.find(item => item.id === newItem.id);
      
      if (existing) {
        const updated = prev.map(item =>
          item.id === newItem.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
        console.log("🔄 Producto existente, cantidad aumentada:", updated);
        return updated;
      }
      
      const newCartItem = { ...newItem, cantidad: 1 };
      const updated = [...prev, newCartItem];
      console.log("✨ Nuevo producto añadido al carrito:", updated);
      return updated;
    });
  };

  const removeItem = (id: string) => {
    console.log("❌ Eliminando del carrito:", id);
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, cantidad: number) => {
    console.log("📦 Actualizando cantidad:", id, cantidad);
    if (cantidad <= 0) {
      removeItem(id);
      return;
    }
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, cantidad } : item
      )
    );
  };

  const clearCart = () => {
    console.log("🗑️ Limpiando carrito");
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.cantidad, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

  console.log("📊 Estado actual del carrito:", { items, totalItems, totalPrice });

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice
    }}>
      {children}
    </CartContext.Provider>
  );
};