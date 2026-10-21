import assert from "node:assert/strict";
import { test } from "node:test";
import { loadTypeScriptModule } from "./load-typescript.mjs";

const { nextOrderStatuses, nextPaymentStatuses } = await loadTypeScriptModule(
  new URL("../src/lib/order-status.ts", import.meta.url),
);

test("admins move orders forward and cancel only before shipping", () => {
  assert.deepEqual(nextOrderStatuses("pending"), ["confirmed", "shipped", "delivered", "cancelled"]);
  assert.deepEqual(nextOrderStatuses("confirmed"), ["shipped", "delivered", "cancelled"]);
  assert.deepEqual(nextOrderStatuses("shipped"), ["delivered"]);
  assert.deepEqual(nextOrderStatuses("delivered"), []);
  assert.deepEqual(nextOrderStatuses("cancelled"), []);
});

test("cash is only marked collected once the order has shipped", () => {
  assert.deepEqual(nextPaymentStatuses("pending", "confirmed"), ["failed"]);
  assert.deepEqual(nextPaymentStatuses("pending", "shipped"), ["paid", "failed"]);
  assert.deepEqual(nextPaymentStatuses("failed", "delivered"), ["pending", "paid"]);
  assert.deepEqual(nextPaymentStatuses("paid", "delivered"), ["refunded"]);
  assert.deepEqual(nextPaymentStatuses("refunded", "delivered"), []);
  assert.deepEqual(nextPaymentStatuses("pending", "cancelled"), ["failed"]);
});
