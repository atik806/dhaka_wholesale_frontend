import type { Product } from "@/src/types/product";
import type { CartItem } from "@/src/types/cart";
import { API_BASE } from "./constants";
import { authFetch } from "./auth-api";

interface BackendProduct {
  id: string;
  slug: string;
  name: string;
  description?: string;
  price: number;
  original_price: number | null;
  category_id: string;
  images: string[];
  rating?: number;
  review_count?: number;
  stock: string;
  tags?: string[];
  sizes?: string[];
  colors?: { name: string; hex: string }[];
  is_new?: boolean;
  is_featured?: boolean;
  created_at?: string;
  categories?: { name: string; slug: string } | null;
}

export interface ServerCartRow {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  selected_size: string | null;
  selected_color: string | null;
  created_at?: string;
  products: BackendProduct | null;
}

export interface ServerWishlistRow {
  id: string;
  user_id: string;
  product_id: string;
  created_at?: string;
  products?: BackendProduct | null;
}

function mapProduct(p: BackendProduct): Product {
  const sizes = p.sizes ?? [];
  const colors = p.colors ?? [];
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.categories?.name ?? "Uncategorized",
    price: p.price,
    originalPrice: p.original_price ?? undefined,
    images: p.images ?? [],
    rating: p.rating ?? 0,
    reviewCount: p.review_count ?? 0,
    stock: (["in-stock", "low-stock", "out-of-stock"].includes(p.stock)
      ? p.stock
      : "in-stock") as Product["stock"],
    description: p.description ?? "",
    tags: p.tags ?? [],
    variants: {
      sizes: sizes.length > 0 ? sizes : undefined,
      colors: colors.length > 0 ? colors : undefined,
    },
    isNew: p.is_new ?? undefined,
    isFeatured: p.is_featured ?? undefined,
    createdAt: p.created_at ?? "",
  };
}

async function parseJson<T>(res: Response): Promise<T> {
  const json = await res.json();
  if (!res.ok) {
    throw new Error(
      typeof json.message === "string" ? json.message : `HTTP ${res.status}`,
    );
  }
  return (json.data ?? json) as T;
}

export function mapServerCartToItems(rows: ServerCartRow[]): CartItem[] {
  return rows
    .filter((row) => row.products)
    .map((row) => ({
      serverId: row.id,
      product: mapProduct(row.products as BackendProduct),
      quantity: row.quantity,
      selectedSize: row.selected_size ?? undefined,
      selectedColor: row.selected_color ?? undefined,
    }));
}

export async function fetchServerCart(): Promise<ServerCartRow[]> {
  const res = await authFetch(`${API_BASE}/cart`);
  return parseJson<ServerCartRow[]>(res);
}

export async function mergeServerCart(
  items: {
    product_id: string;
    quantity: number;
    selected_size?: string;
    selected_color?: string;
  }[],
): Promise<{ items: ServerCartRow[] }> {
  const res = await authFetch(`${API_BASE}/cart/merge`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
  return parseJson<{ items: ServerCartRow[] }>(res);
}

export async function addServerCartItem(item: {
  product_id: string;
  quantity: number;
  selected_size?: string;
  selected_color?: string;
}): Promise<{ id: string }> {
  const res = await authFetch(`${API_BASE}/cart`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  });
  return parseJson<{ id: string }>(res);
}

export async function updateServerCartItem(
  itemId: string,
  dto: {
    quantity: number;
    selected_size?: string;
    selected_color?: string;
  },
): Promise<void> {
  const res = await authFetch(`${API_BASE}/cart/${itemId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  await parseJson(res);
}

export async function removeServerCartItem(itemId: string): Promise<void> {
  const res = await authFetch(`${API_BASE}/cart/${itemId}`, {
    method: "DELETE",
  });
  await parseJson(res);
}

export async function clearServerCart(): Promise<void> {
  const res = await authFetch(`${API_BASE}/cart`, { method: "DELETE" });
  await parseJson(res);
}

export async function fetchServerWishlist(): Promise<ServerWishlistRow[]> {
  const res = await authFetch(`${API_BASE}/wishlist`);
  return parseJson<ServerWishlistRow[]>(res);
}

export async function mergeServerWishlist(
  productIds: string[],
): Promise<{ items: ServerWishlistRow[] }> {
  const res = await authFetch(`${API_BASE}/wishlist/merge`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ product_ids: productIds }),
  });
  return parseJson<{ items: ServerWishlistRow[] }>(res);
}

export async function addServerWishlistItem(productId: string): Promise<void> {
  const res = await authFetch(`${API_BASE}/wishlist`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ product_id: productId }),
  });
  await parseJson(res);
}

export async function removeServerWishlistItem(
  productId: string,
): Promise<void> {
  const res = await authFetch(`${API_BASE}/wishlist/${productId}`, {
    method: "DELETE",
  });
  await parseJson(res);
}
