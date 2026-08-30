import React, { createContext, useState, useEffect, useCallback } from 'react';

export const CartContext = createContext(null);

const CART_KEY = 'crustcraft_cart';

const loadCart = () => {
  try {
    const saved = localStorage.getItem(CART_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(loadCart);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = useCallback((item) => {
    setItems(prev => {
      const key = item.isCustom ? `custom_${Date.now()}` : item.id;
      if (!item.isCustom) {
        const existing = prev.find(i => i.id === item.id && !i.isCustom);
        if (existing) {
          return prev.map(i =>
            i.id === item.id && !i.isCustom
              ? { ...i, quantity: i.quantity + (item.quantity || 1) }
              : i
          );
        }
      }
      return [...prev, { ...item, id: key, quantity: item.quantity || 1 }];
    });
  }, []);

  const removeFromCart = useCallback((itemId) => {
    setItems(prev => prev.filter(i => i.id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId, quantity) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(i => i.id !== itemId));
      return;
    }
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity } : i));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const tax = Math.round(subtotal * 0.18 * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;

  return (
    <CartContext.Provider value={{
      items, itemCount, subtotal, tax, total,
      addToCart, removeFromCart, updateQuantity, clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
};
