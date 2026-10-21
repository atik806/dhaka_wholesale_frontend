import assert from "node:assert/strict";
import { test } from "node:test";
import { loadTypeScriptModule } from "./load-typescript.mjs";

const { stockStatusFor, parseStockQuantity } = await loadTypeScriptModule(
  new URL("../src/lib/inventory.ts", import.meta.url),
);

test("stock status follows the backend thresholds", () => {
  assert.equal(stockStatusFor(0), "out-of-stock");
  assert.equal(stockStatusFor(1), "low-stock");
  assert.equal(stockStatusFor(5), "low-stock");
  assert.equal(stockStatusFor(6), "in-stock");
});

test("stock quantity must be a whole number of units", () => {
  assert.equal(parseStockQuantity(0), 0);
  assert.equal(parseStockQuantity("12"), 12);
  assert.equal(typeof parseStockQuantity(""), "string");
  assert.equal(typeof parseStockQuantity(-1), "string");
  assert.equal(typeof parseStockQuantity(2.5), "string");
});
