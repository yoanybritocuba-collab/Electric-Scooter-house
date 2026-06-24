import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

interface CartItem {
  id: string;
  variantId?: string;
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

const getCartItemId = (productId: string, variantId?: string): string => {
  return variantId ? `${productId}_${variantId}` : productId;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart debe usarse dentro de CartProvider");
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const savedCart = localStorage.getItem(`cart_${user.uid}`);
      if (savedCart) {
        try {
          const parsed = JSON.parse(savedCart);
          if (Array.isArray(parsed)) {
            setItems(parsed);
          }
        } catch (error) {
          console.error("Error cargando carrito:", error);
          setItems([]);
        }
      } else {
        setItems([]);
      }
    } else {
      const savedCart = localStorage.getItem('cart_guest');
      if (savedCart) {
        try {
          const parsed = JSON.parse(savedCart);
          if (Array.isArray(parsed)) {
            setItems(parsed);
          }
        } catch (error) {
          console.error("Error cargando carrito invitado:", error);
          setItems([]);
        }
      } else {
        setItems([]);
      }
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`cart_${user.uid}`, JSON.stringify(items));
    } else {
      localStorage.setItem('cart_guest', JSON.stringify(items));
    }
  }, [items, user]);

  const addItem = (newItem: Omit<CartItem, 'cantidad'>) => {
    const cartId = getCartItemId(newItem.id, newItem.variantId);
    
    setItems(prev => {
      const existing = prev.find(item => {
        const itemCartId = getCartItemId(item.id, item.variantId);
        return itemCartId === cartId;
      });
      
      if (existing) {
        return prev.map(item => {
          const itemCartId = getCartItemId(item.id, item.variantId);
          return itemCartId === cartId
            ? { ...item, cantidad: item.cantidad + 1 }
            : item;
        });
      }
      
      return [...prev, { ...newItem, cantidad: 1 }];
    });
  };

  const removeItem = (cartId: string) => {
    setItems(prev => prev.filter(item => {
      const itemCartId = getCartItemId(item.id, item.variantId);
      return itemCartId !== cartId;
    }));
  };

  const updateQuantity = (cartId: string, cantidad: number) => {
    if (cantidad <= 0) {
      removeItem(cartId);
      return;
    }
    setItems(prev =>
      prev.map(item => {
        const itemCartId = getCartItemId(item.id, item.variantId);
        return itemCartId === cartId ? { ...item, cantidad } : item
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.cantidad, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

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