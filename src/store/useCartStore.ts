"use client";

import { create } from "zustand";
import type { CartStore } from "@/src/types/cart";

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  wishlistIds: [],

  addItem: (item) =>
    set((state) => {
      const existing = state.items.find(
        (i) =>
          i.product.id === item.product.id &&
          i.selectedSize === item.selectedSize &&
          i.selectedColor === item.selectedColor
      );
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.product.id === item.product.id &&
            i.selectedSize === item.selectedSize &&
            i.selectedColor === item.selectedColor
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        };
      }
      return { items: [...state.items, item] };
    }),

  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((i) => i.product.id !== productId),
    })),

  updateQuantity: (productId, quantity) =>
    set((state) => ({
      items: quantity <= 0
        ? state.items.filter((i) => i.product.id !== productId)
        : state.items.map((i) =>
            i.product.id === productId ? { ...i, quantity } : i
          ),
    })),

  clearCart: () => set({ items: [] }),

  toggleWishlist: (productId) =>
    set((state) => ({
      wishlistIds: state.wishlistIds.includes(productId)
        ? state.wishlistIds.filter((id) => id !== productId)
        : [...state.wishlistIds, productId],
    })),

  isInWishlist: (productId) => get().wishlistIds.includes(productId),

  totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

  totalPrice: () =>
    get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
}));
