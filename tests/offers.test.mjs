import assert from "node:assert/strict";
import { test } from "node:test";
import { loadTypeScriptModule } from "./load-typescript.mjs";

const {
  dhakaInputToIso,
  getCountdownParts,
  getDiscountPercent,
  getOfferStatus,
  toDhakaInputValue,
} = await loadTypeScriptModule(new URL("../src/lib/offers.ts", import.meta.url));

test("offer status follows exact start and end boundaries", () => {
  const offer = {
    enabled: true,
    starts_at: "2026-10-01T04:00:00.000Z",
    ends_at: "2026-12-31T17:59:00.000Z",
  };

  assert.equal(getOfferStatus(offer, Date.parse("2026-10-01T03:59:59.999Z")), "scheduled");
  assert.equal(getOfferStatus(offer, Date.parse(offer.starts_at)), "live");
  assert.equal(getOfferStatus(offer, Date.parse(offer.ends_at) - 1), "live");
  assert.equal(getOfferStatus(offer, Date.parse(offer.ends_at)), "ended");
  assert.equal(getOfferStatus({ ...offer, enabled: false }, Date.parse(offer.starts_at)), "draft");
  assert.equal(getOfferStatus({ enabled: true }, Date.parse(offer.starts_at)), "draft");
});

test("Dhaka datetime-local values round-trip without depending on machine timezone", () => {
  const iso = "2026-10-01T04:00:00.000Z";
  assert.equal(toDhakaInputValue(iso), "2026-10-01T10:00");
  assert.equal(dhakaInputToIso("2026-10-01T10:00"), iso);
  assert.equal(dhakaInputToIso(""), null);
  assert.equal(dhakaInputToIso("not-a-date"), null);
  assert.equal(dhakaInputToIso("2026-02-30T10:00"), null);
});

test("discounts are rounded and reject invalid or non-sale prices", () => {
  assert.equal(getDiscountPercent(9_800, 8_900), 9);
  assert.equal(getDiscountPercent(12_900, 12_500), 3);
  assert.equal(getDiscountPercent(100, 100), 0);
  assert.equal(getDiscountPercent(100, 101), 0);
  assert.equal(getDiscountPercent(0, 1), 0);
});

test("countdown values clamp at zero and keep full day counts", () => {
  const end = "2026-10-03T04:00:01.000Z";
  assert.deepEqual(getCountdownParts(end, Date.parse("2026-10-01T04:00:00.000Z")), {
    days: 2,
    hours: 0,
    minutes: 0,
    seconds: 1,
  });
  assert.deepEqual(getCountdownParts(end, Date.parse(end)), {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
});
