"use client";
import { useState } from "react";
import useSWR from "swr";
import { authFetch, type UserOrder } from "@/src/lib/auth-api";
import { API_BASE } from "@/src/lib/constants";
import {
  Panel,
  Field,
  ErrorMessage,
  inputClass,
  buttonClass,
  labelFor,
} from "@/src/components/admin/operations/shared";
type CustomerOps = {
  shipments: {
    courier: string;
    tracking_number: string;
    tracking_url: string | null;
    status: string;
    expected_delivery: string | null;
  }[];
  returns: {
    id: string;
    quantity: number;
    kind: string;
    status: string;
    decision_reason: string | null;
    refunds: { amount: number; status: string }[];
  }[];
};
async function request(path: string, body?: unknown) {
  const res = await authFetch(API_BASE + path, {
    ...(body ? { method: "POST", body: JSON.stringify(body) } : {}),
    headers: { "Content-Type": "application/json" },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? "Request failed");
  return json.data;
}
export function CustomerOrderOperations({ order }: { order: UserOrder }) {
  const { data, error, mutate } = useSWR<CustomerOps>(
    "customer-operations:" + order.id,
    () => request("/orders/" + order.id + "/operations"),
  );
  const [saveError, setSaveError] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <div className="space-y-6">
      <ErrorMessage message={saveError || (error as Error)?.message || ""} />
      {data?.shipments.map((s) => (
        <Panel key={s.tracking_number} title="Track your delivery">
          <p className="text-sm">
            {s.courier} · {s.tracking_number}
          </p>
          <p className="text-sm text-muted">
            {labelFor(s.status)}
            {s.expected_delivery ? " · Expected " + s.expected_delivery : ""}
          </p>
          {s.tracking_url && (
            <a
              href={s.tracking_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-link underline"
            >
              Track parcel
            </a>
          )}
        </Panel>
      ))}
      {data?.returns && data.returns.length > 0 && (
        <Panel title="Your returns">
          {data.returns.map((r) => (
            <div
              key={r.id}
              className="rounded-xl border border-line p-3 text-sm"
            >
              <p>
                {r.quantity} units · {labelFor(r.kind)} · {labelFor(r.status)}
              </p>
              {r.decision_reason && (
                <p className="mt-1 text-muted">{r.decision_reason}</p>
              )}
              {r.refunds?.map((f, i) => (
                <p key={i} className="mt-1">
                  Refund: BDT {f.amount} · {labelFor(f.status)}
                </p>
              ))}
            </div>
          ))}
        </Panel>
      )}
      {order.status === "delivered" && (
        <Panel title="Request a return or exchange">
          <form
            className="space-y-3"
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const f = new FormData(form);
              setSaveError("");
              setBusy(true);
              try {
                await request("/orders/" + order.id + "/operations/returns", {
                  order_item_id: f.get("order_item_id"),
                  quantity: Number(f.get("quantity")),
                  kind: f.get("kind"),
                  reason: f.get("reason"),
                  photos: String(f.get("photos") ?? "")
                    .split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean),
                });
                form.reset();
                await mutate();
              } catch (e) {
                setSaveError((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <Field label="Item">
              <select name="order_item_id" className={inputClass}>
                {order.order_items.map((i) => (
                  <option value={i.id} key={i.id}>
                    {i.product_name} {i.selected_size} {i.selected_color} ·
                    purchased {i.quantity}
                  </option>
                ))}
              </select>
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Quantity">
                <input
                  name="quantity"
                  className={inputClass}
                  type="number"
                  min="1"
                  max="999"
                  defaultValue="1"
                  required
                />
              </Field>
              <Field label="Preferred resolution">
                <select name="kind" className={inputClass}>
                  <option value="refund">Refund</option>
                  <option value="exchange">Exchange</option>
                </select>
              </Field>
            </div>
            <Field label="Reason">
              <textarea
                name="reason"
                className={inputClass}
                maxLength={2000}
                required
              />
            </Field>
            <Field label="Photo links (optional, one per line)">
              <textarea name="photos" className={inputClass} />
            </Field>
            <button className={buttonClass} disabled={busy}>
              {busy ? "Submitting…" : "Submit request"}
            </button>
          </form>
        </Panel>
      )}
    </div>
  );
}
