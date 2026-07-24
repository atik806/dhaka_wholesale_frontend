import { useAuthStore } from "@/src/store/useAuthStore";
import { useCartStore } from "@/src/store/useCartStore";
import type { CartItem } from "@/src/types/cart";
import {
  addServerCartItem,
  addServerWishlistItem,
  clearServerCart,
  fetchServerCart,
  fetchServerWishlist,
  mapServerCartToItems,
  mergeServerCart,
  mergeServerWishlist,
  removeServerCartItem,
  removeServerWishlistItem,
  updateServerCartItem,
} from "./cart-api";

let mergeInFlight: Promise<void> | null = null;
let loadInFlight: Promise<void> | null = null;

function isAuthenticated(): boolean {
  const { user, session } = useAuthStore.getState();
  return !!user && !!session?.access_token;
}

function guestCartPayload(items: CartItem[]) {
  return items.map((item) => ({
    product_id: item.product.id,
    quantity: item.quantity,
    selected_size: item.selectedSize,
    selected_color: item.selectedColor,
  }));
}

/** Replace local Zustand cart/wishlist from server (authenticated sessions). */
export async function loadServerCartAndWishlist(): Promise<void> {
  if (!isAuthenticated()) return;
  // Prefer in-flight merge (it ends with a load) over a parallel overwrite.
  if (mergeInFlight) return mergeInFlight;
  if (loadInFlight) return loadInFlight;

  loadInFlight = (async () => {
    try {
      const [cartRows, wishRows] = await Promise.all([
        fetchServerCart(),
        fetchServerWishlist(),
      ]);
      useCartStore.getState().replaceItems(mapServerCartToItems(cartRows));
      useCartStore
        .getState()
        .setWishlistIds(wishRows.map((row) => row.product_id));
      useCartStore.getState().setServerSynced(true);
    } catch (err) {
      console.error("[cart-sync] Failed to load server cart/wishlist:", err);
    } finally {
      loadInFlight = null;
    }
  })();

  return loadInFlight;
}

export type GuestCartSnapshot = {
  items: CartItem[];
  wishlistIds: string[];
};

/** Capture guest cart/wishlist before setAuth to avoid race with session load. */
export function snapshotGuestCart(): GuestCartSnapshot {
  const { items, wishlistIds } = useCartStore.getState();
  return {
    items: items.map((i) => ({ ...i, product: { ...i.product } })),
    wishlistIds: [...wishlistIds],
  };
}

/**
 * On login/register/OAuth: merge local guest cart + wishlist into server,
 * then replace local state with the authoritative server cart.
 * Pass a pre-setAuth snapshot when possible to avoid races with RootClient load.
 */
export async function mergeGuestCartOnLogin(
  snapshot?: GuestCartSnapshot,
): Promise<void> {
  if (!isAuthenticated()) return;
  if (mergeInFlight) return mergeInFlight;

  const guest = snapshot ?? snapshotGuestCart();

  mergeInFlight = (async () => {
    try {
      if (guest.items.length > 0) {
        const result = await mergeServerCart(guestCartPayload(guest.items));
        useCartStore
          .getState()
          .replaceItems(mapServerCartToItems(result.items ?? []));
      }

      if (guest.wishlistIds.length > 0) {
        const result = await mergeServerWishlist(guest.wishlistIds);
        useCartStore
          .getState()
          .setWishlistIds((result.items ?? []).map((row) => row.product_id));
      }

      // Always reload so empty-guest + existing-server cart still hydrates.
      await loadServerCartAndWishlist();
    } catch (err) {
      console.error("[cart-sync] Merge on login failed:", err);
      // Fall back to server load so auth cart is still usable.
      await loadServerCartAndWishlist();
    } finally {
      mergeInFlight = null;
    }
  })();

  return mergeInFlight;
}

export async function syncAddCartItem(item: CartItem): Promise<void> {
  if (!isAuthenticated()) return;
  try {
    const row = await addServerCartItem({
      product_id: item.product.id,
      quantity: item.quantity,
      selected_size: item.selectedSize,
      selected_color: item.selectedColor,
    });
    if (row?.id) {
      useCartStore.setState((state) => ({
        items: state.items.map((i) =>
          i.product.id === item.product.id &&
          (i.selectedSize ?? null) === (item.selectedSize ?? null) &&
          (i.selectedColor ?? null) === (item.selectedColor ?? null)
            ? { ...i, serverId: row.id }
            : i,
        ),
      }));
    }
  } catch (err) {
    console.error("[cart-sync] addItem sync failed:", err);
  }
}

export async function syncUpdateCartQuantity(
  productId: string,
  quantity: number,
  selectedSize?: string,
  selectedColor?: string,
  serverId?: string,
): Promise<void> {
  if (!isAuthenticated()) return;
  const id =
    serverId ||
    useCartStore
      .getState()
      .items.find(
        (i) =>
          i.product.id === productId &&
          (i.selectedSize ?? null) === (selectedSize ?? null) &&
          (i.selectedColor ?? null) === (selectedColor ?? null),
      )?.serverId;
  if (!id) {
    // No server id yet — reload to reconcile.
    await loadServerCartAndWishlist();
    return;
  }
  if (quantity <= 0) {
    try {
      await removeServerCartItem(id);
    } catch (err) {
      console.error("[cart-sync] remove on qty<=0 failed:", err);
    }
    return;
  }
  try {
    await updateServerCartItem(id, {
      quantity,
      selected_size: selectedSize,
      selected_color: selectedColor,
    });
  } catch (err) {
    console.error("[cart-sync] updateQuantity sync failed:", err);
  }
}

export async function syncRemoveCartItem(
  productId: string,
  selectedSize?: string,
  selectedColor?: string,
  serverId?: string,
): Promise<void> {
  if (!isAuthenticated()) return;
  const id =
    serverId ||
    useCartStore
      .getState()
      .items.find(
        (i) =>
          i.product.id === productId &&
          (i.selectedSize ?? null) === (selectedSize ?? null) &&
          (i.selectedColor ?? null) === (selectedColor ?? null),
      )?.serverId;
  if (!id) return;
  try {
    await removeServerCartItem(id);
  } catch (err) {
    console.error("[cart-sync] removeItem sync failed:", err);
  }
}

export async function syncClearCart(): Promise<void> {
  if (!isAuthenticated()) return;
  try {
    await clearServerCart();
  } catch (err) {
    console.error("[cart-sync] clearCart sync failed:", err);
  }
}

export async function syncToggleWishlist(
  productId: string,
  nowInWishlist: boolean,
): Promise<void> {
  if (!isAuthenticated()) return;
  try {
    if (nowInWishlist) {
      await addServerWishlistItem(productId);
    } else {
      await removeServerWishlistItem(productId);
    }
  } catch (err) {
    console.error("[cart-sync] wishlist sync failed:", err);
  }
}
