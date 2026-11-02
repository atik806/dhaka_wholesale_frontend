import test from "node:test";
import assert from "node:assert/strict";
import { loadTypeScriptModule } from "./load-typescript.mjs";

const { isOthersCategory } = await loadTypeScriptModule(new URL("../src/lib/category-priority.ts", import.meta.url));

const cat = (id, slug, parentId = null) => ({ id, slug, parentId, name: slug, image: "", productCount: 0, description: "" });
const all = [
  cat("o", "others"),
  cat("t", "tws", "o"),
  cat("f", "fashion-accessories"),
  cat("h", "hair-claw-clips", "f"),
];

test("the Others department and its children are low priority", () => {
  assert.equal(isOthersCategory(all[0], all), true);
  assert.equal(isOthersCategory(all[1], all), true);
});

test("focus categories are not", () => {
  assert.equal(isOthersCategory(all[2], all), false);
  assert.equal(isOthersCategory(all[3], all), false);
});
