"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartStore } from "@/src/types/cart";

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      wishlistIds: [],

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (i) =>
              i.product.id === item.product.id &&
              i.selectedSize === item.selectedSize &&
              i.selectedColor === item.selectedColor,
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product.id === item.product.id &&
                i.selectedSize === item.selectedSize &&
                i.selectedColor === item.selectedColor
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i,
              ),
            };
          }
          return { items: [...state.items, item] };
        }),

      removeItem: (productId, selectedSize, selectedColor) =>
        set((state) => ({
          items: state.items.filter(
            (i) =>
              !(
                i.product.id === productId &&
                (i.selectedSize ?? null) === (selectedSize ?? null) &&
                (i.selectedColor ?? null) === (selectedColor ?? null)
              ),
          ),
        })),

      updateQuantity: (productId, quantity, selectedSize, selectedColor) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter(
                  (i) =>
                    !(
                      i.product.id === productId &&
                      (i.selectedSize ?? null) === (selectedSize ?? null) &&
                      (i.selectedColor ?? null) === (selectedColor ?? null)
                    ),
                )
              : state.items.map((i) =>
                  i.product.id === productId &&
                  (i.selectedSize ?? null) === (selectedSize ?? null) &&
                  (i.selectedColor ?? null) === (selectedColor ?? null)
                    ? { ...i, quantity }
                    : i,
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
    }),
    {
      name: "cholokini-cart",
      partialize: (state) => ({
        items: state.items,
        wishlistIds: state.wishlistIds,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) state._hydrated = true;
      },
    },
  ),
);

export function useCartHydrated() {
  return useCartStore((s) => s._hydrated);
}
