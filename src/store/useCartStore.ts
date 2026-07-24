"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartStore } from "@/src/types/cart";

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      wishlistIds: [],
      serverSynced: false,

      addItem: (item) => {
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
        });
        void import("@/src/lib/cart-sync").then((m) => m.syncAddCartItem(item));
      },

      removeItem: (productId, selectedSize, selectedColor) => {
        const match = get().items.find(
          (i) =>
            i.product.id === productId &&
            (i.selectedSize ?? null) === (selectedSize ?? null) &&
            (i.selectedColor ?? null) === (selectedColor ?? null),
        );
        set((state) => ({
          items: state.items.filter(
            (i) =>
              !(
                i.product.id === productId &&
                (i.selectedSize ?? null) === (selectedSize ?? null) &&
                (i.selectedColor ?? null) === (selectedColor ?? null)
              ),
          ),
        }));
        void import("@/src/lib/cart-sync").then((m) =>
          m.syncRemoveCartItem(
            productId,
            selectedSize,
            selectedColor,
            match?.serverId,
          ),
        );
      },

      updateQuantity: (productId, quantity, selectedSize, selectedColor) => {
        const match = get().items.find(
          (i) =>
            i.product.id === productId &&
            (i.selectedSize ?? null) === (selectedSize ?? null) &&
            (i.selectedColor ?? null) === (selectedColor ?? null),
        );
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
        }));
        void import("@/src/lib/cart-sync").then((m) =>
          m.syncUpdateCartQuantity(
            productId,
            quantity,
            selectedSize,
            selectedColor,
            match?.serverId,
          ),
        );
      },

      clearCart: () => {
        set({ items: [] });
        void import("@/src/lib/cart-sync").then((m) => m.syncClearCart());
      },

      toggleWishlist: (productId) => {
        const wasIn = get().wishlistIds.includes(productId);
        set((state) => ({
          wishlistIds: wasIn
            ? state.wishlistIds.filter((id) => id !== productId)
            : [...state.wishlistIds, productId],
        }));
        void import("@/src/lib/cart-sync").then((m) =>
          m.syncToggleWishlist(productId, !wasIn),
        );
      },

      isInWishlist: (productId) => get().wishlistIds.includes(productId),

      replaceItems: (items) => set({ items }),

      setWishlistIds: (ids) => set({ wishlistIds: ids }),

      setServerSynced: (synced) => set({ serverSynced: synced }),

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
