import type { Product } from "./product";

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface CartStore {
  items: CartItem[];
  wishlistIds: string[];
  _hydrated?: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, selectedSize?: string, selectedColor?: string) => void;
  updateQuantity: (productId: string, quantity: number, selectedSize?: string, selectedColor?: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  totalItems: () => number;
  totalPrice: () => number;
}
