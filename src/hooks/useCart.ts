"use client";

import { useState, useCallback, useEffect } from "react";
import type { Cart, CartItem } from "@/types/cart";

const CART_KEY = "blackbeer_cart";

function loadCart(): Cart {
  if (typeof window === "undefined") return { items: [], subtotal: 0, itemCount: 0 };
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return { items: [], subtotal: 0, itemCount: 0 };
    const items: CartItem[] = JSON.parse(raw);
    return recalculate(items);
  } catch {
    return { items: [], subtotal: 0, itemCount: 0 };
  }
}

function recalculate(items: CartItem[]): Cart {
  const subtotal = items.reduce((sum, item) => {
    if (item.comparePrice && item.comparePrice > item.price) {
      const pairs = Math.floor(item.quantity / 2);
      const singles = item.quantity % 2;
      return sum + (pairs * item.comparePrice) + (singles * item.price);
    }
    return sum + item.price * item.quantity;
  }, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  return { items, subtotal, itemCount };
}

function persist(items: CartItem[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }
}

export function useCart() {
  const [cart, setCart] = useState<Cart>({ items: [], subtotal: 0, itemCount: 0 });

  useEffect(() => {
    setCart(loadCart());
  }, []);

  const addItem = useCallback((item: Omit<CartItem, "quantity">, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.items.find(
        (i) => i.productId === item.productId && 
               i.variantId === item.variantId && 
               i.variantName === item.variantName
      );
      let newItems: CartItem[];

      if (existing) {
        newItems = prev.items.map((i) =>
          i.productId === item.productId && 
          i.variantId === item.variantId && 
          i.variantName === item.variantName
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      } else {
        newItems = [...prev.items, { ...item, quantity }];
      }

      persist(newItems);
      return recalculate(newItems);
    });
  }, []);

  const removeItem = useCallback((productId: string, variantId?: string, variantName?: string) => {
    setCart((prev) => {
      const newItems = prev.items.filter(
        (i) => !(
          i.productId === productId && 
          i.variantId === variantId && 
          i.variantName === variantName
        )
      );
      persist(newItems);
      return recalculate(newItems);
    });
  }, []);

  const updateQuantity = useCallback(
    (productId: string, quantity: number, variantId?: string, variantName?: string) => {
      setCart((prev) => {
        if (quantity <= 0) {
          const newItems = prev.items.filter(
            (i) => !(
              i.productId === productId && 
              i.variantId === variantId && 
              i.variantName === variantName
            )
          );
          persist(newItems);
          return recalculate(newItems);
        }

        const newItems = prev.items.map((i) =>
          i.productId === productId && 
          i.variantId === variantId && 
          i.variantName === variantName
            ? { ...i, quantity }
            : i
        );
        persist(newItems);
        return recalculate(newItems);
      });
    },
    []
  );

  const clearCart = useCallback(() => {
    persist([]);
    setCart({ items: [], subtotal: 0, itemCount: 0 });
  }, []);

  return { cart, addItem, removeItem, updateQuantity, clearCart };
}
