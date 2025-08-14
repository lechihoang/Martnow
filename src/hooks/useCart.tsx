"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

export interface CartItem {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  sellerId: number;
  sellerName: string;
  stock: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart từ localStorage khi component mount
  useEffect(() => {
    const savedCart = localStorage.getItem('shopping-cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Throttle localStorage saves để tránh quá nhiều writes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem('shopping-cart', JSON.stringify(items));
    }, 500); // Delay 500ms

    return () => clearTimeout(timeoutId);
  }, [items]);

  const addToCart = useCallback((newItem: Omit<CartItem, 'quantity'>) => {
    setItems(currentItems => {
      // Kiểm tra sản phẩm đã có trong giỏ hàng chưa
      const existingItem = currentItems.find(item => item.productId === newItem.productId);
      
      if (existingItem) {
        // Nếu đã có, tăng quantity (nhưng không vượt quá stock)
        return currentItems.map(item =>
          item.productId === newItem.productId
            ? { ...item, quantity: Math.min(item.quantity + 1, newItem.stock) }
            : item
        );
      } else {
        // Nếu chưa có, thêm mới với quantity = 1
        return [...currentItems, { ...newItem, quantity: 1 }];
      }
    });
  }, []);

  const removeFromCart = useCallback((productId: number) => {
    setItems(currentItems => currentItems.filter(item => item.productId !== productId));
  }, []);

  const updateQuantity = useCallback((productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems(currentItems =>
      currentItems.map(item =>
        item.productId === productId
          ? { ...item, quantity: Math.min(newQuantity, item.stock) }
          : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getTotalPrice = useCallback(() => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [items]);

  const getTotalItems = useCallback(() => {
    return items.reduce((total, item) => total + item.quantity, 0);
  }, [items]);

  const contextValue = useMemo(() => ({
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
  }), [items, addToCart, removeFromCart, updateQuantity, clearCart, getTotalPrice, getTotalItems]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export default CartContext;
