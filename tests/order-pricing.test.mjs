import assert from "node:assert/strict";
import { test } from "node:test";
import { loadTypeScriptModule } from "./load-typescript.mjs";

const { orderDiscountLines, createCheckoutKeyStore } = await loadTypeScriptModule(
  new URL("../src/lib/order-pricing.ts", import.meta.url),
);

test("an order without a discount snapshot shows no discount lines", () => {
  assert.deepEqual(orderDiscountLines({ subtotal: 200 }), []);
  assert.deepEqual(
    orderDiscountLines({ subtotal: 200, original_subtotal: 200, discount_total: 0 }),
    [],
  );
});

test("combo and coupon discounts are listed against the pre-discount items total", () => {
  assert.deepEqual(
    orderDiscountLines({
      subtotal: 135,
      original_subtotal: 180,
      combo_discount: 30,
      coupon_discount: 15,
      discount_total: 45,
      coupon_code: "SAVE10",
    }),
    [
      { label: "Items", amount: 180 },
      { label: "Combo discount", amount: -30 },
      { label: "Coupon (SAVE10)", amount: -15 },
    ],
  );
});

test("numeric strings from the API are treated as numbers", () => {
  assert.deepEqual(
    orderDiscountLines({
      subtotal: "90.00",
      original_subtotal: "100.00",
      combo_discount: "0.00",
      coupon_discount: "10.00",
      discount_total: "10.00",
      coupon_code: null,
    }),
    [
      { label: "Items", amount: 100 },
      { label: "Coupon", amount: -10 },
    ],
  );
});

test("a retried checkout reuses its key until the request changes or succeeds", () => {
  let n = 0;
  const store = createCheckoutKeyStore(() => `key-${String(++n).padStart(16, "0")}`);

  const first = store.keyFor("cart-a");
  assert.match(first, /^[A-Za-z0-9_-]{16,100}$/);
  assert.equal(store.keyFor("cart-a"), first);

  const changed = store.keyFor("cart-b");
  assert.notEqual(changed, first);

  store.reset();
  assert.notEqual(store.keyFor("cart-b"), changed);
});
