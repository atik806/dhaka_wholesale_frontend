import type { Category } from "../types/product.ts";

/** Rebuild the complete hierarchy when only the flat category response exists. */
export function buildCategoryTree(categories: Category[]): Category[] {
  const nodes = new Map(categories.map((category) => [category.id, { ...category, children: [] as Category[] }]));
  const roots: Category[] = [];

  for (const node of nodes.values()) {
    const parent = node.parentId ? nodes.get(node.parentId) : undefined;
    const seen = new Set([node.id]);
    let ancestor = parent;
    while (ancestor && !seen.has(ancestor.id)) {
      seen.add(ancestor.id);
      ancestor = ancestor.parentId ? nodes.get(ancestor.parentId) : undefined;
    }
    if (parent && !ancestor) parent.children.push(node);
    else roots.push(node);
  }
  return roots;
}

export function findCategoryInTree(categories: Category[], id: string): Category | undefined {
  const pending = [...categories];
  const visited = new Set<string>();
  while (pending.length) {
    const category = pending.shift()!;
    if (visited.has(category.id)) continue;
    if (category.id === id) return category;
    visited.add(category.id);
    pending.push(...(category.children ?? []));
  }
}

/** Counts products assigned to this category and every descendant once. */
export function countCategoryProducts(category: Category): number {
  const pending = [category];
  const visited = new Set<string>();
  let count = 0;
  while (pending.length) {
    const node = pending.pop()!;
    if (visited.has(node.id)) continue;
    visited.add(node.id);
    count += node.productCount ?? 0;
    pending.push(...(node.children ?? []));
  }
  return count;
}
