import assert from "node:assert/strict";
import { test } from "node:test";
import { loadTypeScriptModule } from "./load-typescript.mjs";

const { buildCategoryTree, countCategoryProducts, findCategoryInTree } = await loadTypeScriptModule(new URL("../src/lib/category-tree.ts", import.meta.url));

function category(id, parentId = null, productCount = 0) {
  return { id, parentId, productCount, name: id, slug: id, image: "", description: "" };
}

test("a parent exposes every child, including empty children", () => {
  const names = ["bracelet", "brooches-pins", "earrings", "hair-bands", "hair-claw-clips", "scrunchies"];
  const flat = [category("fashion-accessories"), ...names.map((name, index) => category(name, "fashion-accessories", index))];
  const tree = buildCategoryTree(flat);
  assert.deepEqual(tree[0].children.map((child) => child.slug), names);
  assert.equal(tree[0].children[0].productCount, 0);
  assert.equal(countCategoryProducts(tree[0]), 15);
  assert.equal(flat[0].children, undefined, "API data must not be mutated");
});

test("nested descendants remain discoverable and totals include all levels", () => {
  const tree = buildCategoryTree([category("grandchild", "child", 3), category("parent", null, 2), category("child", "parent", 5)]);
  assert.equal(findCategoryInTree(tree, "grandchild")?.parentId, "child");
  assert.equal(findCategoryInTree(tree, "child")?.children[0].id, "grandchild");
  assert.equal(countCategoryProducts(tree[0]), 10);
  assert.equal(findCategoryInTree(tree, "unknown"), undefined);
});

test("large category collections are not truncated to a page", () => {
  const tree = buildCategoryTree([category("parent"), ...Array.from({ length: 1200 }, (_, index) => category(`child-${index}`, "parent", 1))]);
  assert.equal(tree[0].children.length, 1200);
  assert.equal(countCategoryProducts(tree[0]), 1200);
});

test("empty collections and missing parents remain usable", () => {
  assert.deepEqual(buildCategoryTree([]), []);
  assert.equal(findCategoryInTree([], "missing"), undefined);
  assert.equal(buildCategoryTree([category("orphan", "missing")])[0].id, "orphan");
});

test("malformed cycles cannot hang traversal or double-count products", () => {
  const a = category("a", "b", 2);
  const b = category("b", "a", 3);
  assert.equal(buildCategoryTree([a, b]).length, 2);
  a.children = [b];
  b.children = [a];
  assert.equal(countCategoryProducts(a), 5);
  assert.equal(findCategoryInTree([a], "missing"), undefined);
});
