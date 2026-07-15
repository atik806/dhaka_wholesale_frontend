import useSWR from 'swr';
import {
  fetchProducts,
  fetchFeaturedProducts,
  fetchProductBySlug,
  fetchRelatedProducts,
  fetchCategories,
  fetchCategoryBySlug,
  fetchReviewsByProduct,
  type ProductQueryParams,
} from '@/src/lib/api';

const SWR_CONFIG = {
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  dedupingInterval: 60000,
  errorRetryCount: 2,
};

export function useProducts(params: ProductQueryParams = {}) {
  const key = `/products?${new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== '' && v !== 'popular')
      .map(([k, v]) => [k, String(v)])
  ).toString()}`;

  return useSWR(key, () => fetchProducts(params), {
    ...SWR_CONFIG,
    revalidateOnFocus: false,
    keepPreviousData: true,
  });
}

export function useFeaturedProducts() {
  return useSWR('/products/featured', () => fetchFeaturedProducts(), {
    ...SWR_CONFIG,
    revalidateOnFocus: false,
  });
}

export function useProduct(slug: string | null) {
  return useSWR(slug ? `/products/${slug}` : null, () => fetchProductBySlug(slug!), {
    ...SWR_CONFIG,
  });
}

export function useRelatedProducts(slug: string | null) {
  return useSWR(
    slug ? `/products/${slug}/related` : null,
    () => fetchRelatedProducts(slug!),
    { ...SWR_CONFIG }
  );
}

export function useCategories() {
  return useSWR('/categories', () => fetchCategories(), {
    ...SWR_CONFIG,
    revalidateOnFocus: false,
  });
}

export function useCategory(slug: string | null) {
  return useSWR(slug ? `/categories/${slug}` : null, () => fetchCategoryBySlug(slug!), {
    ...SWR_CONFIG,
  });
}

export function useProductReviews(productId: string | null, page = 1) {
  return useSWR(
    productId ? `/products/${productId}/reviews?page=${page}` : null,
    () => fetchReviewsByProduct(productId!, page),
    { ...SWR_CONFIG },
  );
}
