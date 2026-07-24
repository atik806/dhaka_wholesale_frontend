import type { Product } from "./product";

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  /** Server cart_items.id when authenticated + synced */
  serverId?: string;
}

export interface CartStore {
  items: CartItem[];
  wishlistIds: string[];
  _hydrated?: boolean;
  /** True after a successful authenticated load/merge from the server */
  serverSynced?: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, selectedSize?: string, selectedColor?: string) => void;
  updateQuantity: (productId: string, quantity: number, selectedSize?: string, selectedColor?: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  replaceItems: (items: CartItem[]) => void;
  setWishlistIds: (ids: string[]) => void;
  setServerSynced: (synced: boolean) => void;
  totalItems: () => number;
  totalPrice: () => number;
}
