"use client";
import { useState } from "react";
import useSWR from "swr";
import {
  opsGet,
  opsSave,
  reportCsv,
  type SalesReport,
} from "@/src/lib/operations-api";
import { RevenueChart } from "@/src/components/admin/RevenueChart";
import { formatPrice } from "@/src/lib/utils";
import { useAdminAccess } from "./AccessContext";
import {
  Panel,
  PageTitle,
  Field,
  ErrorMessage,
  inputClass,
  buttonClass,
  secondaryClass,
  labelFor,
} from "./shared";
type Options = {
  products: { id: string; name: string }[];
  categories: { id: string; name: string }[];
  couriers: string[];
};
const today = () =>
  new Date(Date.now() + 6 * 3600000).toISOString().slice(0, 10);
export function ReportsPage() {
  const { permissions } = useAdminAccess();
  const [from, setFrom] = useState(() =>
      new Date(Date.now() + 6 * 3600000 - 29 * 86400000)
        .toISOString()
        .slice(0, 10),
    ),
    [to, setTo] = useState(today),
    [search, setSearch] = useState(""),
    [product, setProduct] = useState(""),
    [category, setCategory] = useState(""),
    [courier, setCourier] = useState(""),
    [report, setReport] = useState<SalesReport | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const { data: options } = useSWR(["report-options", search], () =>
    opsGet<Options>("report-options", { search }),
  );
  const { data: settings, mutate: refreshSettings } = useSWR(
    permissions.includes("*") ? "operations-settings" : null,
    () =>
      opsGet<{ review_after_hours: number; return_window_days: number }>(
        "settings",
      ),
  );
  async function load() {
    setBusy(true);
    setError("");
    setReport(null);
    try {
      const result = await opsGet<SalesReport>("reports", {
        from: new Date(from + "T00:00:00+06:00").toISOString(),
        to: new Date(
          new Date(to + "T00:00:00+06:00").getTime() + 86400000,
        ).toISOString(),
        product_id: product,
        category_id: category,
        courier,
      });
      setReport(result.data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function download() {
    if (!report) return;
    const url = URL.createObjectURL(
      new Blob(["\uFEFF" + reportCsv(report)], {
        type: "text/csv;charset=utf-8",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download =
      "sales-report-" +
      report.from.slice(0, 10) +
      "-" +
      report.to.slice(0, 10) +
      ".csv";
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <>
      <PageTitle
        title="Business reports"
        description="Review sales, refunds, costs, and cash collected. All report dates use Dhaka time."
      />
      <div className="space-y-6">
        <Panel title="Report filters">
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              void load();
            }}
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="From">
                <input
                  type="date"
                  className={inputClass}
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  required
                />
              </Field>
              <Field label="Through">
                <input
                  type="date"
                  className={inputClass}
                  value={to}
                  min={from}
                  onChange={(e) => setTo(e.target.value)}
                  required
                />
              </Field>
              <Field label="Find product">
                <input
                  className={inputClass}
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setProduct("");
                  }}
                  placeholder="Search product names"
                />
              </Field>
              <Field label="Orders containing product">
                <select
                  className={inputClass}
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                >
                  <option value="">All products</option>
                  {options?.data.products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Orders containing category">
                <select
                  className={inputClass}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">All categories</option>
                  {options?.data.categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Courier">
                <select
                  className={inputClass}
                  value={courier}
                  onChange={(e) => setCourier(e.target.value)}
                >
                  <option value="">All couriers</option>
                  {options?.data.couriers.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <button className={buttonClass} disabled={busy}>
              {busy ? "Generating…" : "Generate report"}
            </button>
          </form>
          <ErrorMessage message={error} />
        </Panel>
        {report && (
          <>
            <Panel title="Sales and operations">
              <p className="text-xs text-muted">
                Sales metrics include delivered orders created during this
                period and their completed refunds to date. Cash metrics use
                actual collection/refund dates. Product and category filters
                include whole matching orders.
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {Object.entries(report.summary).map(([key, value]) => (
                  <div className="rounded-xl border border-line p-4" key={key}>
                    <p className="text-xs text-muted">{labelFor(key)}</p>
                    <p className="mt-2 text-xl font-bold">
                      {value === null
                        ? "Unknown"
                        : key.endsWith("_rate")
                          ? value + "%"
                          : /orders|missing|lines/.test(key)
                            ? value
                            : formatPrice(value)}
                    </p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted">
                Profit remains unknown when historical unit costs are missing.
                Contribution also requires recorded delivery costs.
              </p>
              <button className={secondaryClass} onClick={download}>
                Download this report as CSV
              </button>
            </Panel>
            <Panel title="Delivered sales by order date">
              <RevenueChart
                data={report.daily.map((d) => ({
                  date: d.report_date,
                  revenue: d.sales,
                  orders: d.orders,
                }))}
              />
            </Panel>
            <Panel title="Best-selling products">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-line">
                      <th className="py-3">Product / SKU</th>
                      <th>Units</th>
                      <th>Sales after discounts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.products.map((p, i) => (
                      <tr key={i} className="border-b border-line">
                        <td className="py-3">
                          {p.product_name}
                          <span className="block text-xs text-muted">
                            {p.sku_snapshot ??
                              [p.size, p.color].filter(Boolean).join(" / ")}
                          </span>
                        </td>
                        <td>{p.units}</td>
                        <td>{formatPrice(p.sales)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!report.products.length && (
                  <p className="py-6 text-sm text-muted">
                    No delivered sales in this period.
                  </p>
                )}
              </div>
            </Panel>
            <Panel title="Current stock valuation">
              <p className="text-2xl font-bold">
                {formatPrice(report.stock_valuation.known_value)}
              </p>
              <p className="text-sm text-muted">
                Known-cost stock only.{" "}
                {report.stock_valuation.missing_cost_items} stocked items have
                unknown costs.
              </p>
            </Panel>
          </>
        )}
        {permissions.includes("*") && settings && (
          <Panel title="Operations rules">
            <form
              key={JSON.stringify(settings.data)}
              className="space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                setError("");
                try {
                  await opsSave(
                    "settings",
                    {
                      review_after_hours: Number(f.get("review_after_hours")),
                      return_window_days: Number(f.get("return_window_days")),
                    },
                    "PATCH",
                  );
                  await refreshSettings();
                } catch (e) {
                  setError((e as Error).message);
                }
              }}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Mark review overdue after (hours)">
                  <input
                    name="review_after_hours"
                    type="number"
                    min="1"
                    max="720"
                    defaultValue={settings.data.review_after_hours}
                    className={inputClass}
                    required
                  />
                </Field>
                <Field label="Return window after delivery (days)">
                  <input
                    name="return_window_days"
                    type="number"
                    min="1"
                    max="365"
                    defaultValue={settings.data.return_window_days}
                    className={inputClass}
                    required
                  />
                </Field>
              </div>
              <button className={buttonClass}>Save rules</button>
            </form>
          </Panel>
        )}
      </div>
    </>
  );
}
