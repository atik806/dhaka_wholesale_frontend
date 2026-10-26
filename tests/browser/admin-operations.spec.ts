import { test, expect, type Page } from "@playwright/test";
const id = "00000000-0000-4000-8000-000000000001";
const actor = "00000000-0000-4000-8000-000000000002";
async function setup(page: Page, permissions = ["*"]) {
  await page.context().addCookies([
    {
      name: "dw_session",
      value: "isolated-ui-test",
      url: "http://127.0.0.1:3107",
    },
  ]);
  const calls: { path: string; body: Record<string, unknown> }[] = [];
  const order = {
    id,
    user_id: actor,
    status: "pending",
    payment_status: "pending",
    payment_method: "cod",
    subtotal: 200,
    shipping_cost: 80,
    tax: 0,
    total: 280,
    created_at: new Date().toISOString(),
    shipping_address: {
      firstName: "Test",
      lastName: "Customer",
      email: "customer@example.test",
      phone: "01712345678",
      address: "Dhaka",
    },
    order_items: [
      {
        id,
        product_id: id,
        product_name: "Cotton Shirt",
        price: 100,
        quantity: 2,
        selected_size: "M",
        selected_color: "Red",
      },
    ],
  };
  const review = {
    order_id: id,
    status: "awaiting",
    version: 1,
    assigned_to: null,
    phone_confirmed: false,
    address_checked: false,
    stock_checked: false,
    contact_attempts: 0,
    reason: "",
    updated_at: new Date().toISOString(),
    orders: order,
  };
  let shipment: Record<string, unknown> | null = null;
  const product = {
    id,
    name: "Cotton Shirt",
    slug: "cotton-shirt",
    sizes: ["M"],
    colors: [{ name: "Red", hex: "#ff0000" }],
    stock_quantity: 10,
    inventory_version: 1,
    inventory_mode: "product",
    low_stock_threshold: 5,
    unit_cost: 20,
    inventory_variants: [] as Record<string, unknown>[],
  };
  const ret = {
    id,
    order_id: id,
    order_item_id: id,
    quantity: 1,
    kind: "refund",
    reason: "Damaged item",
    status: "inspected",
    decision_reason: "Inspected",
    version: 4,
    photos: [],
    created_at: new Date().toISOString(),
    order_items: {
      product_name: "Cotton Shirt",
      price: 100,
      selected_size: "M",
      selected_color: "Red",
    },
    refunds: [] as Record<string, unknown>[],
  };
  const notification = {
    id,
    title: "New order needs review",
    href: "/admin/orders/" + id,
    created_at: new Date().toISOString(),
    notification_reads: [] as Record<string, unknown>[],
  };
  const report = {
    from: new Date().toISOString(),
    to: new Date().toISOString(),
    timezone: "Asia/Dhaka",
    currency: "BDT",
    filter_scope: "Matching orders",
    summary: {
      orders: 1,
      sales: 200,
      refunds: 100,
      net_sales: 100,
      estimated_gross_profit: 80,
      estimated_contribution: 110,
      missing_cost_lines: 0,
    },
    products: [
      {
        product_id: id,
        product_name: "Cotton Shirt",
        sku_snapshot: "SHIRT-M",
        size: "M",
        color: "Red",
        units: 2,
        sales: 200,
      },
    ],
    daily: [],
    stock_valuation: { known_value: 200, missing_cost_items: 0 },
  };
  await page.route("**/api/**", async (route) => {
    const url = new URL(route.request().url()),
      path = url.pathname.replace("/api/", "");
    const method = route.request().method();
    let data: unknown = [];
    let meta: Record<string, unknown> | undefined;
    if (method !== "GET") {
      const body = route.request().postDataJSON() ?? {};
      calls.push({ path, body });
      if (path.endsWith("/review")) {
        Object.assign(review, body, { version: review.version + 1 });
        if (body.status === "approved") order.status = "confirmed";
      }
      if (path.endsWith("/shipment"))
        shipment = {
          ...body,
          id,
          order_id: id,
          version: Number(body.version) + 1,
        };
      if (path.endsWith("/configure")) {
        product.inventory_mode = "variant";
        product.inventory_variants = body.variants.map((v: object) => ({
          ...v,
          inventory_version: 1,
          id,
        }));
      }
      if (path.endsWith("/adjust"))
        product.stock_quantity += Number(body.delta);
      if (path.endsWith("/refund"))
        ret.refunds = [{ id, amount: body.amount, status: "approved" }];
      if (path.endsWith("/refund/complete"))
        Object.assign(ret.refunds[0], body, { status: "completed" });
      if (path.endsWith("/read"))
        notification.notification_reads = [
          { read_at: new Date().toISOString() },
        ];
      data = { saved: true };
    } else if (path === "admin/operations/session")
      data = {
        user_id: actor,
        enabled: true,
        groups: permissions.includes("*") ? ["owner"] : ["support"],
        permissions,
      };
    else if (path === "auth/profile")
      data = {
        id: actor,
        name: "Owner",
        email: "owner@example.test",
        role: "admin",
      };
    else if (path === "admin/dashboard")
      data = { stats: { pendingOrders: 1, unreadMessages: 0, pendingBugs: 0 } };
    else if (path === "admin/orders/" + id) data = order;
    else if (path === "admin/operations/order/" + id)
      data = {
        review,
        shipment,
        notes: [],
        activity: [],
        assignees: [{ user_id: actor, profiles: { name: "Owner" } }],
        settings: { review_after_hours: 24, return_window_days: 14 },
        permissions,
      };
    else if (path === "admin/operations/reviews") data = [review];
    else if (path === "admin/operations/inventory") data = [product];
    else if (path === "admin/operations/returns") data = [ret];
    else if (path === "admin/operations/notifications") {
      data = [notification];
      meta = { unread: notification.notification_reads.length ? 0 : 1 };
    } else if (path === "admin/operations/settings")
      data = { review_after_hours: 24, return_window_days: 14 };
    else if (path === "admin/operations/assignees")
      data = [{ id: actor, name: "Owner" }];
    else if (path === "admin/operations/report-options")
      data = {
        products: [{ id, name: "Cotton Shirt" }],
        categories: [],
        couriers: [],
      };
    else if (path === "admin/operations/reports") data = report;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data,
        meta: {
          total: Array.isArray(data) ? data.length : 0,
          page: 1,
          limit: 25,
          totalPages: 1,
          ...meta,
        },
      }),
    });
  });
  return { calls, product };
}
test("order checklist saves the real choices and unlocks shipment preparation", async ({
  page,
}) => {
  const { calls } = await setup(page);
  await page.goto("/admin/orders/" + id);
  await expect(
    page.getByRole("heading", { name: "Order review", exact: true }),
  ).toBeVisible();
  await page
    .getByLabel("Review status", { exact: true })
    .selectOption("approved");
  for (const label of ["Phone confirmed", "Address checked", "Stock checked"])
    await page.getByLabel(label, { exact: true }).check();
  await page.getByLabel("Contact attempts").fill("1");
  await page.getByRole("button", { name: "Save review", exact: true }).click();
  await expect(page.getByLabel("Courier", { exact: true })).toBeVisible();
  await page.getByLabel("Courier", { exact: true }).fill("Local courier");
  await page.getByLabel("Tracking number", { exact: true }).fill("TRACK-001");
  await page
    .getByRole("button", { name: "Save shipment", exact: true })
    .click();
  await expect
    .poll(() => calls.filter((c) => c.path.endsWith("/shipment")).length)
    .toBe(1);
  expect(calls.find((c) => c.path.endsWith("/review"))?.body).toMatchObject({
    version: 1,
    status: "approved",
    phone_confirmed: true,
    address_checked: true,
    stock_checked: true,
  });
});
test("inventory form allocates existing units and requires an adjustment reason", async ({
  page,
}) => {
  const { calls } = await setup(page);
  await page.goto("/admin/inventory");
  await page.getByRole("button", { name: "Allocate SKUs" }).click();
  await page.getByLabel("Allocate units").fill("10");
  await page.getByRole("button", { name: "Allocate variant stock" }).click();
  await expect(page.getByText("COTTON-SHIRT-M-RED: 10")).toBeVisible();
  await page.getByRole("button", { name: "Adjust stock" }).click();
  await page.getByLabel("Stock change").fill("-2");
  await page.getByLabel("Reason for this adjustment").fill("Two damaged units");
  await page.getByRole("button", { name: "Save adjustment" }).click();
  await expect
    .poll(() => calls.filter((c) => c.path.endsWith("/adjust")).length)
    .toBe(1);
  expect(calls.find((c) => c.path.endsWith("/adjust"))?.body).toMatchObject({
    expected_quantity: 10,
    delta: -2,
    reason: "Two damaged units",
  });
});
test("refund approval and payment completion are separate actions", async ({
  page,
}) => {
  const { calls } = await setup(page);
  await page.goto("/admin/returns");
  await page.getByRole("button", { name: "Review request" }).click();
  await page.getByLabel("Refund amount (BDT)").fill("100");
  await page
    .getByRole("button", { name: "Approve refund", exact: true })
    .click();
  await expect(
    page.getByText("Refund Approved", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Review request" }).click();
  await page.getByLabel("Payment or receipt reference").fill("REF-001");
  await page.getByRole("button", { name: "Record completed refund" }).click();
  await expect
    .poll(() => calls.filter((c) => c.path.endsWith("/refund/complete")).length)
    .toBe(1);
  expect(calls.find((c) => c.path.endsWith("/refund/complete"))?.body).toEqual({
    method: "cash",
    reference: "REF-001",
  });
});
test("reports generate and download the displayed data", async ({ page }) => {
  await setup(page);
  await page.goto("/admin/reports");
  await page.getByRole("button", { name: "Generate report" }).click();
  await expect(
    page.getByRole("heading", { name: "Best-selling products" }),
  ).toBeVisible();
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download this report as CSV" })
    .click();
  expect((await download).suggestedFilename()).toMatch(/sales-report.*\.csv$/);
});
test("support sees its own navigation and cannot open financial screens", async ({
  page,
}) => {
  await setup(page, [
    "orders.read",
    "orders.notes",
    "returns.read",
    "returns.request",
    "activity.read",
    "support.manage",
  ]);
  await page.goto("/admin/order-review");
  await expect(
    page.getByRole("heading", { name: "Order review", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Staff Access", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "Reports", exact: true }),
  ).toHaveCount(0);
  await page.goto("/admin/reports");
  await expect(
    page.getByRole("heading", { name: "Your workspace" }),
  ).toBeVisible();
});
test("mobile inventory has usable navigation and no page overflow", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await setup(page);
  await page.goto("/admin/inventory");
  await expect(
    page.getByRole("heading", { name: "Inventory", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Open menu", exact: true }).click();
  await expect(
    page.getByRole("link", { name: "Staff Access", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close menu", exact: true }).click();
  await expect(
    page.getByRole("link", { name: "Staff Access", exact: true }),
  ).not.toBeInViewport();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: testInfo.outputPath("inventory-mobile.png"),
    fullPage: true,
  });
});

test("a conflicting review save preserves the draft and shows the server explanation", async ({
  page,
}) => {
  await setup(page);
  await page.route("**/api/admin/operations/order/*/review", (route) =>
    route.fulfill({
      status: 409,
      contentType: "application/json",
      body: JSON.stringify({
        message: "Another staff member changed this review. Reload and retry.",
      }),
    }),
  );
  await page.goto("/admin/orders/" + id);
  await page.getByLabel("Contact attempts").fill("3");
  await page.getByRole("button", { name: "Save review", exact: true }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Another staff member changed" }),
  ).toContainText("Another staff member changed this review");
  await expect(page.getByLabel("Contact attempts")).toHaveValue("3");
});
test("notification reads update the unread badge", async ({ page }) => {
  await setup(page);
  await page.goto("/admin/notifications");
  await expect(
    page.getByRole("link", { name: "Notifications: 1 unread", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Mark read", exact: true }).click();
  await expect(
    page.getByRole("link", { name: "Notifications: 0 unread", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Mark read", exact: true }),
  ).toHaveCount(0);
});
