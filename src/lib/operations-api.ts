import { adminFetcher } from "./admin-api";
export interface AccessSession {
  user_id: string;
  enabled: boolean;
  groups: string[];
  permissions: string[];
}
export const can = (permissions: string[], permission: string) =>
  permissions.includes("*") || permissions.includes(permission);
export interface PageMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  unread?: number;
}
export async function opsGet<T>(
  path: string,
  query: Record<string, string | number | undefined> = {},
) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query))
    if (value !== undefined && value !== "") params.set(key, String(value));
  return adminFetcher<T>(
    `/admin/operations/${path}${params.size ? "?" + params : ""}`,
  );
}
export async function opsSave<T = unknown>(
  path: string,
  data: unknown,
  method = "POST",
): Promise<T> {
  return (
    await adminFetcher<T>(`/admin/operations/${path}`, {
      method,
      body: JSON.stringify(data),
    })
  ).data;
}
export interface Review {
  order_id: string;
  version: number;
  status: string;
  assigned_to: string | null;
  phone_confirmed: boolean;
  address_checked: boolean;
  stock_checked: boolean;
  contact_attempts: number;
  reason: string | null;
  updated_at: string;
  orders?: {
    id: string;
    created_at: string;
    status: string;
    total: number;
    shipping_address: Record<string, string>;
  };
}
export interface Shipment {
  id: string;
  order_id: string;
  version: number;
  courier: string;
  tracking_number: string;
  tracking_url: string | null;
  status: string;
  expected_delivery: string | null;
  actual_cost: number | null;
  reason: string | null;
  attempts: number;
}
export interface Activity {
  id: string;
  actor_name?: string | null;
  summary?: string | null;
  actor_id: string | null;
  entity_type: string;
  entity_id: string;
  action: string;
  created_at: string;
  before_data?: unknown;
  after_data?: unknown;
}
export interface OrderOperations {
  review: Review;
  notes: { id: string; text: string; actor_id: string; created_at: string }[];
  shipment: Shipment | null;
  activity: Activity[];
  assignees: { user_id: string; profiles: { name: string } }[];
  settings: { review_after_hours: number; return_window_days: number };
  permissions: string[];
}
export interface InventoryVariant {
  id: string;
  sku: string;
  size: string;
  color: string;
  stock_quantity: number;
  inventory_version: number;
  low_stock_threshold: number;
  unit_cost: number | null;
}
export interface InventoryProduct {
  id: string;
  name: string;
  slug: string;
  sizes: string[];
  colors: { name: string; hex: string }[];
  stock_quantity: number;
  inventory_version: number;
  inventory_mode: string;
  low_stock_threshold: number;
  unit_cost: number | null;
  inventory_variants: InventoryVariant[];
}
export interface Refund {
  id: string;
  amount: number;
  status: string;
  method: string | null;
  reference: string | null;
  completed_at: string | null;
}
export interface ReturnRequest {
  id: string;
  order_id: string;
  order_item_id: string;
  quantity: number;
  kind: string;
  reason: string;
  photos: string[];
  status: string;
  decision_reason: string | null;
  restock_quantity: number | null;
  replacement_order_id: string | null;
  version: number;
  created_at: string;
  order_items: {
    product_name: string;
    selected_size: string | null;
    selected_color: string | null;
    price: number;
  };
  refunds: Refund[];
}
export interface Notification {
  id: string;
  title: string;
  href: string;
  created_at: string;
  notification_reads: { read_at: string }[];
}
export interface AccessRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  admin_access: {
    user_id: string;
    staff_id: string | null;
    groups: string[];
    enabled: boolean;
    version: number;
  } | null;
}
export interface SalesReport {
  from: string;
  to: string;
  timezone: string;
  currency: string;
  filter_scope: string;
  summary: Record<string, number | null>;
  products: {
    product_id: string;
    product_name: string;
    sku_snapshot: string | null;
    size: string;
    color: string;
    units: number;
    sales: number;
  }[];
  daily: { report_date: string; orders: number; sales: number }[];
  stock_valuation: { known_value: number; missing_cost_items: number };
}
export const shipmentTransitions: Record<string, string[]> = {
  preparing: ["dispatched"],
  dispatched: ["in_transit", "delivered", "delivery_failed", "returning"],
  in_transit: ["delivered", "delivery_failed", "returning"],
  delivery_failed: ["in_transit", "delivered", "returning"],
  returning: ["returned"],
  returned: [],
  delivered: [],
};
export const returnTransitions: Record<string, string[]> = {
  requested: ["under_review", "approved", "rejected"],
  under_review: ["approved", "rejected"],
  approved: ["received"],
  received: ["inspected"],
  inspected: ["resolved"],
  rejected: [],
  resolved: [],
};
export function landingFor(permissions: string[]) {
  for (const [permission, path] of [
    ["*", "/admin"],
    ["orders.read", "/admin/order-review"],
    ["inventory.read", "/admin/inventory"],
    ["reports.read", "/admin/reports"],
    ["returns.read", "/admin/returns"],
  ])
    if (can(permissions, permission)) return path;
  return "/admin/notifications";
}
export function routePermission(path: string): string {
  if (
    path.startsWith("/admin/orders") ||
    path.startsWith("/admin/order-review") ||
    path.startsWith("/admin/deliveries")
  )
    return "orders.read";
  if (path.startsWith("/admin/inventory")) return "inventory.read";
  if (path.startsWith("/admin/returns")) return "returns.read";
  if (path.startsWith("/admin/activity")) return "activity.read";
  if (path.startsWith("/admin/reports")) return "reports.read";
  if (path.startsWith("/admin/notifications")) return "";
  if (/^\/admin\/(products|categories)/.test(path)) return "products.manage";
  if (/^\/admin\/(reviews|contact-messages|bug-reports)/.test(path))
    return "support.manage";
  return "*";
}
export function csvCell(value: unknown) {
  const text = String(value ?? "");
  return (
    '"' +
    (typeof value === "string" && /^(?:\s*[=+@-]|[\t\r\n])/.test(text)
      ? "'"
      : "") +
    text.replaceAll('"', '""') +
    '"'
  );
}
export function reportCsv(report: SalesReport) {
  return [
    ["Report from", report.from ?? ""],
    ["Report to (exclusive)", report.to ?? ""],
    ["Timezone", report.timezone ?? "Asia/Dhaka"],
    ["Metric", "Value"],
    ...Object.entries(report.summary).map(([key, value]) => [
      key,
      value ?? "Unknown",
    ]),
    [],
    ["Product", "SKU", "Size", "Color", "Units", "Sales"],
    ...report.products.map((p) => [
      p.product_name,
      p.sku_snapshot,
      p.size,
      p.color,
      p.units,
      p.sales,
    ]),
  ]
    .map((row) => row.map(csvCell).join(","))
    .join("\r\n");
}
