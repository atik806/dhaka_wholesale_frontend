import type { Product, Category } from '@/src/types/product';

import { API_BASE } from './constants';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: { total: number; page: number; limit: number; totalPages: number };
}

interface BackendProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  original_price: number | null;
  category_id: string;
  images: string[];
  rating: number;
  review_count: number;
  stock: string;
  tags: string[];
  sizes: string[];
  colors: { name: string; hex: string }[];
  is_new: boolean;
  is_featured: boolean;
  created_at: string;
  categories: { name: string; slug: string };
}

interface BackendCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  product_count: number;
}

function mapProduct(p: BackendProduct): Product {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.categories.name,
    price: p.price,
    originalPrice: p.original_price ?? undefined,
    images: p.images,
    rating: p.rating,
    reviewCount: p.review_count,
    stock: p.stock as Product['stock'],
    description: p.description,
    tags: p.tags,
    variants: {
      sizes: p.sizes.length > 0 ? p.sizes : undefined,
      colors: p.colors.length > 0 ? p.colors : undefined,
    },
    isNew: p.is_new || undefined,
    isFeatured: p.is_featured || undefined,
    createdAt: p.created_at,
  };
}

function mapCategory(c: BackendCategory): Category {
  return {
    id: c.slug,
    name: c.name,
    slug: c.slug,
    image: c.image_url,
    productCount: c.product_count,
    description: c.description,
  };
}

async function fetcher<T>(url: string, signal?: AbortSignal): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_BASE}${url}`, { signal });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

export interface ProductQueryParams {
  search?: string;
  category?: string;
  priceMin?: number;
  priceMax?: number;
  minRating?: number;
  sort?: string;
  page?: number;
  limit?: number;
  ids?: string[];
}

export interface ProductListResult {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function fetchProducts(params: ProductQueryParams = {}, signal?: AbortSignal): Promise<ProductListResult> {
  const qs = new URLSearchParams();
  if (params.search) qs.set('search', params.search);
  if (params.category) qs.set('category', params.category);
  if (params.priceMin !== undefined) qs.set('priceMin', String(params.priceMin));
  if (params.priceMax !== undefined) qs.set('priceMax', String(params.priceMax));
  if (params.minRating !== undefined) qs.set('minRating', String(params.minRating));
  if (params.sort && params.sort !== 'popular') qs.set('sort', params.sort);
  if (params.page && params.page > 1) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.ids && params.ids.length > 0) {
    params.ids.forEach((id) => qs.append('ids', id));
  }

  const q = qs.toString();
  const res = await fetcher<BackendProduct[]>(`/products${q ? `?${q}` : ''}`, signal);
  return {
    products: (res.data || []).map(mapProduct),
    total: res.meta?.total || 0,
    page: res.meta?.page || 1,
    limit: res.meta?.limit || 12,
    totalPages: res.meta?.totalPages || 0,
  };
}

export async function fetchProductBySlug(slug: string, signal?: AbortSignal): Promise<Product | null> {
  try {
    const res = await fetcher<BackendProduct>(`/products/${encodeURIComponent(slug)}`, signal);
    return res.data ? mapProduct(res.data) : null;
  } catch {
    return null;
  }
}

export async function fetchRelatedProducts(slug: string, signal?: AbortSignal): Promise<Product[]> {
  try {
    const res = await fetcher<BackendProduct[]>(`/products/${encodeURIComponent(slug)}/related`, signal);
    return (res.data || []).map(mapProduct);
  } catch {
    return [];
  }
}

export async function fetchFeaturedProducts(signal?: AbortSignal): Promise<Product[]> {
  const res = await fetcher<BackendProduct[]>('/products/featured', signal);
  return (res.data || []).map(mapProduct);
}

export interface CategoryListResult {
  categories: Category[];
}

export async function fetchCategories(signal?: AbortSignal): Promise<Category[]> {
  const res = await fetcher<BackendCategory[]>('/categories', signal);
  return (res.data || []).map(mapCategory);
}

export async function fetchCategoryBySlug(slug: string, signal?: AbortSignal): Promise<Category | null> {
  try {
    const res = await fetcher<BackendCategory>(`/categories/${encodeURIComponent(slug)}`, signal);
    return res.data ? mapCategory(res.data) : null;
  } catch {
    return null;
  }
}

export async function submitReport(data: {
  message: string;
  screenshot_url?: string | null;
  page_url: string;
  priority?: string;
}): Promise<void> {
  const res = await fetch(`${API_BASE}/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to submit report');
  }
}

export async function uploadReportScreenshot(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/upload/report-screenshot`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to upload screenshot');
  }
  const json = await res.json();
  return json.data?.url || json.url;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  text: string;
  created_at: string;
  updated_at: string;
  profiles: { name: string; avatar_url: string | null } | null;
}

export interface ReviewsResult {
  data: Review[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export async function fetchReviewsByProduct(
  productId: string,
  page = 1,
  limit = 20,
  signal?: AbortSignal,
): Promise<ReviewsResult> {
  const res = await fetch(
    `${API_BASE}/products/${productId}/reviews?page=${page}&limit=${limit}`,
    { signal },
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function submitReview(
  productId: string,
  rating: number,
  text: string,
  token: string,
): Promise<Review> {
  const res = await fetch(`${API_BASE}/products/${productId}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ rating, text }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to submit review');
  return json.data || json;
}
