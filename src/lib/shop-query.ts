/**
 * Pure query-parsing/key-building logic for the Shop listing page, shared by
 * the server-side fetch (src/lib/server/data.ts) and the client SWR hook
 * (app/shop/ShopPageClient.tsx) so both compute the exact same SWR key for
 * the exact same URL — required for SSR `fallbackData` to actually hydrate
 * instead of silently refetching.
 */

export interface ShopUrlParams {
  categories?: string;
  price?: string;
  rating?: string;
  sort?: string;
  page?: string;
}

export interface ShopFilters {
  selectedCategoryNames: string[];
  priceRange: string;
  ratingParam: string | null;
  sort: string;
  page: number;
}

export function parseShopFilters(sp: ShopUrlParams): ShopFilters {
  const categoriesParam = sp.categories || "";
  return {
    selectedCategoryNames: categoriesParam ? categoriesParam.split(",") : [],
    priceRange: sp.price || "all",
    ratingParam: sp.rating || null,
    sort: sp.sort || "popular",
    page: parseInt(sp.page || "1", 10) || 1,
  };
}

/** A single selected category name whose slug isn't resolvable yet means the
 * categories list hasn't loaded — matches ShopPageClient's readiness guard. */
export function isCategorySlugReady(
  selectedCategoryNames: string[],
  categorySlugByName: Record<string, string>
): boolean {
  return (
    selectedCategoryNames.length !== 1 ||
    Boolean(categorySlugByName[selectedCategoryNames[0]])
  );
}

export function buildShopSwrKey(
  filters: ShopFilters,
  categorySlugByName: Record<string, string>
): string | null {
  const { selectedCategoryNames, priceRange, ratingParam, sort, page } = filters;
  if (!isCategorySlugReady(selectedCategoryNames, categorySlugByName)) return null;

  const parts: string[] = [];
  if (selectedCategoryNames.length === 1) {
    parts.push(`cat=${categorySlugByName[selectedCategoryNames[0]]}`);
  }
  if (selectedCategoryNames.length > 1) {
    parts.push(`cats=${selectedCategoryNames.join(",")}`);
  }
  if (priceRange !== "all") parts.push(`price=${priceRange}`);
  if (ratingParam) parts.push(`rating=${ratingParam}`);
  parts.push(`sort=${sort}`);
  parts.push(`page=${page}`);
  return `/shop?${parts.join("&")}`;
}

export function buildShopFetchParams(
  filters: ShopFilters,
  categorySlugByName: Record<string, string>,
  limit: number
): Record<string, unknown> {
  const { selectedCategoryNames, priceRange, ratingParam, sort, page } = filters;
  const params: Record<string, unknown> = {};
  if (priceRange !== "all") {
    const [min, max] = priceRange.split("-").map(Number);
    params.priceMin = min;
    params.priceMax = max;
  }
  if (ratingParam) params.minRating = parseInt(ratingParam, 10);
  params.sort = sort;
  params.page = page;
  params.limit = limit;
  if (selectedCategoryNames.length > 1) {
    params.categories = selectedCategoryNames
      .map((name) => categorySlugByName[name])
      .filter(Boolean);
  } else if (selectedCategoryNames.length === 1) {
    params.category = categorySlugByName[selectedCategoryNames[0]];
  }
  return params;
}

export function categorySlugMapByName(
  categories: { name: string; slug: string }[]
): Record<string, string> {
  return Object.fromEntries(categories.map((c) => [c.name, c.slug]));
}
