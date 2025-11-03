import React, { createContext, useState, ReactNode } from 'react';

export type CartItem = {
  productId: number;
  restaurantId: number;
  name: string;
  price: number;
  quantity: number;
};

type CartContextData = {
  items: CartItem[];
  restaurantId: number | null;
  addItem: (item: CartItem) => boolean;
  removeItem: (productId: number) => void;
  clear: () => void;
};

export const CartContext = createContext<CartContextData | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [restaurantId, setRestaurantId] = useState<number | null>(null);

  function addItem(item: CartItem) {
    if (restaurantId && restaurantId !== item.restaurantId) {
      return false;
    }
    setRestaurantId(item.restaurantId);
    setItems(prev => {
      const idx = prev.findIndex(i => i.productId === item.productId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx].quantity += item.quantity;
        return copy;
      }
      return [...prev, item];
    });
    return true;
  }

  function removeItem(productId: number) {
    const newItems = items.filter(i => i.productId !== productId);
    setItems(newItems);
    if (newItems.length === 0) setRestaurantId(null);
  }

  function clear() { setItems([]); setRestaurantId(null); }

  return (
    <CartContext.Provider value={{ items, restaurantId, addItem, removeItem, clear }}>
      {children}
    </CartContext.Provider>
  );
};