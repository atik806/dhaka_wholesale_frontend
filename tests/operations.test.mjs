import test from "node:test";
import assert from "node:assert/strict";
import { loadComponentWithMocks } from "./load-typescript.mjs";
const api = await loadComponentWithMocks(
  new URL("../src/lib/operations-api.ts", import.meta.url),
  { "./admin-api": {} },
  { URLSearchParams },
);
test("staff landing pages and route permissions match their available work", () => {
  assert.equal(
    api.landingFor(["inventory.read", "products.manage"]),
    "/admin/inventory",
  );
  assert.equal(
    api.landingFor(["orders.read", "returns.read"]),
    "/admin/order-review",
  );
  assert.equal(api.routePermission("/admin/access"), "*");
  assert.equal(api.routePermission("/admin/reports"), "reports.read");
  assert.equal(api.can(["orders.read"], "inventory.manage"), false);
});
test("CSV exports escape commas, quotes, line breaks and spreadsheet formulas", () => {
  assert.equal(api.csvCell('=HYPERLINK("bad")'), '"\'=HYPERLINK(""bad"")"');
  assert.equal(api.csvCell("Cotton, red"), '"Cotton, red"');
  const csv = api.reportCsv({
    summary: { sales: 100, estimated_gross_profit: null },
    products: [
      {
        product_name: 'A "shirt"',
        sku_snapshot: "SKU-1",
        size: "M",
        color: "Red",
        units: 2,
        sales: 100,
      },
    ],
  });
  assert.match(csv, /"estimated_gross_profit","Unknown"/);
  assert.match(csv, /A ""shirt""/);
});
test("shipment and return choices cannot reopen completed work", () => {
  assert.deepEqual(Array.from(api.shipmentTransitions.delivered), []);
  assert.deepEqual(Array.from(api.returnTransitions.resolved), []);
  assert.ok(api.shipmentTransitions.delivery_failed.includes("in_transit"));
  assert.ok(!api.returnTransitions.inspected.includes("received"));
});
