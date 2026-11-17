import type { Category } from "@/src/types/product";

/**
 * Slug of the catch-all department for lines the store is not focusing on
 * (electronics, gadgets). Its categories are listed after everything else.
 */
export const OTHERS_CATEGORY_SLUG = "others";

/** True for the Others department and every category nested under it. */
export function isOthersCategory(category: Category, all: Category[]): boolean {
  const byId = new Map(all.map((c) => [c.id, c]));
  const seen = new Set<string>();
  let current: Category | undefined = category;
  while (current && !seen.has(current.id)) {
    if (current.slug === OTHERS_CATEGORY_SLUG) return true;
    seen.add(current.id);
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }
  return false;
}

/**
 * The only department the storefront lists. Shop, search and offers pages
 * show products from this category tree; the Others department is hidden
 * from shoppers but stays fully visible in the admin panel.
 */
export const STORE_DEPARTMENT_SLUG = "fashion-accessories";

/** Categories shoppers may see: everything outside the Others department. */
export function storeCategories(all: Category[]): Category[] {
  return all.filter((c) => !isOthersCategory(c, all));
}

/** Same as storeCategories for a nested tree (Others is a top-level node). */
export function storeCategoryTree(tree: Category[]): Category[] {
  return tree
    .filter((c) => c.slug !== OTHERS_CATEGORY_SLUG)
    .map((c) => (c.children ? { ...c, children: storeCategoryTree(c.children) } : c));
}
