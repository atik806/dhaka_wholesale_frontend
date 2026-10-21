import assert from "node:assert/strict";
import { test } from "node:test";
import { loadTypeScriptModule } from "./load-typescript.mjs";

const { promotionSaveRequest } = await loadTypeScriptModule(
  new URL("../src/lib/offers.ts", import.meta.url),
);

const coupon = {
  id: "00000000-0000-4000-8000-000000000001",
  code: "WELCOME10",
  enabled: true,
  starts_at: "2026-10-21T00:00:00.000Z",
  ends_at: "2026-10-28T00:00:00.000Z",
  type: "percentage",
  value: 10,
  minimum_spend: 0,
  maximum_discount: null,
  max_redemptions: 100,
  per_customer_limit: 1,
};

test("an edit sends the version it started from, without listing-only fields", () => {
  const { body, version } = promotionSaveRequest({
    ...coupon,
    updated_at: "2026-10-21T10:00:00.000+00:00",
    redemptions: 4,
  });
  assert.equal(version, "2026-10-21T10:00:00.000+00:00");
  assert.deepEqual(body, coupon);
});

test("a new promotion is saved as a create", () => {
  assert.equal(promotionSaveRequest(coupon).version, "new");
});
