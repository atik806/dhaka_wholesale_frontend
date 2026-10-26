"use client";
import { useState } from "react";
import Link from "next/link";
import {
  can,
  opsSave,
  returnTransitions,
  type ReturnRequest,
} from "@/src/lib/operations-api";
import { formatPrice } from "@/src/lib/utils";
import { useAdminAccess } from "./AccessContext";
import {
  useOpsList,
  PageTitle,
  Panel,
  Field,
  Pager,
  ListState,
  ErrorMessage,
  inputClass,
  buttonClass,
  secondaryClass,
  labelFor,
} from "./shared";
export function ReturnsPage() {
  const { permissions } = useAdminAccess();
  const [page, setPage] = useState(1),
    [status, setStatus] = useState(""),
    [selected, setSelected] = useState<ReturnRequest | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const list = useOpsList<ReturnRequest>("returns", { page, status });
  async function save(path: string, data: unknown, method = "POST") {
    setBusy(true);
    setError("");
    try {
      await opsSave(path, data, method);
      list.refresh();
      setSelected(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const refund = selected?.refunds?.[0];
  return (
    <>
      <PageTitle
        title="Returns & refunds"
        description="Review requests, inspect received items, and record completed refunds."
      />
      <div className="space-y-6">
        <Panel title="Return requests">
          <Field label="Status">
            <select
              value={status}
              className={inputClass}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              {[
                "",
                "requested",
                "under_review",
                "approved",
                "rejected",
                "received",
                "inspected",
                "resolved",
              ].map((s) => (
                <option key={s} value={s}>
                  {s ? labelFor(s) : "All statuses"}
                </option>
              ))}
            </select>
          </Field>
          <ListState
            loading={list.loading}
            error={list.error}
            empty={!list.data.length}
          />
          {!list.loading &&
            list.data.map((r) => (
              <article key={r.id} className="rounded-xl border border-line p-4">
                <div className="flex flex-wrap justify-between gap-3">
                  <div>
                    <p className="font-semibold">
                      {r.order_items?.product_name} · {r.quantity} units ·{" "}
                      {labelFor(r.kind)}
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      {labelFor(r.status)} · Order{" "}
                      <Link
                        className="text-link"
                        href={"/admin/orders/" + r.order_id}
                      >
                        #{r.order_id.slice(0, 8)}
                      </Link>
                      {r.refunds?.[0]
                        ? " · Refund " +
                          labelFor(r.refunds[0].status) +
                          " " +
                          formatPrice(r.refunds[0].amount)
                        : ""}
                    </p>
                    <p className="mt-2 text-sm">{r.reason}</p>
                  </div>
                  <button
                    className={secondaryClass}
                    onClick={() => {
                      setSelected(r);
                      setError("");
                    }}
                  >
                    Review request
                  </button>
                </div>
              </article>
            ))}
          <Pager meta={list.meta} onPage={setPage} />
        </Panel>
        {selected && (
          <Panel
            key={selected.id + selected.version}
            title={
              selected.order_items.product_name +
              " · " +
              labelFor(selected.status)
            }
          >
            <div className="flex flex-wrap justify-between gap-3">
              <p className="text-sm text-muted">
                Requested: {selected.quantity} ·{" "}
                {selected.order_items.selected_size}{" "}
                {selected.order_items.selected_color}
              </p>
              <button
                className={secondaryClass}
                onClick={() => setSelected(null)}
                disabled={busy}
              >
                Close
              </button>
            </div>
            <ErrorMessage message={error} />
            {selected.photos?.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {selected.photos.map((url, i) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-link underline"
                  >
                    Photo {i + 1}
                  </a>
                ))}
              </div>
            )}
            {selected.decision_reason && (
              <p className="rounded-xl bg-surface-2 p-3 text-sm">
                {selected.decision_reason}
              </p>
            )}
            {can(permissions, "returns.request") &&
              (returnTransitions[selected.status]?.length ?? 0) > 0 && (
                <form
                  className="space-y-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const f = new FormData(e.currentTarget);
                    void save(
                      "returns/" + selected.id,
                      {
                        version: selected.version,
                        status: f.get("status"),
                        decision_reason: f.get("decision_reason"),
                        ...(f.get("restock_quantity") !== null
                          ? {
                              restock_quantity: Number(
                                f.get("restock_quantity"),
                              ),
                            }
                          : {}),
                        replacement_order_id:
                          f.get("replacement_order_id") || null,
                      },
                      "PATCH",
                    );
                  }}
                >
                  <Field label="Next step">
                    <select name="status" className={inputClass}>
                      {returnTransitions[selected.status].map((s) => (
                        <option key={s} value={s}>
                          {labelFor(s)}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Decision or inspection notes">
                    <textarea
                      name="decision_reason"
                      className={inputClass}
                      maxLength={2000}
                    />
                  </Field>
                  {selected.status === "received" && (
                    <Field label="Units in sellable condition to restock">
                      <input
                        name="restock_quantity"
                        type="number"
                        min="0"
                        max={selected.quantity}
                        defaultValue="0"
                        className={inputClass}
                        required
                      />
                      <span className="text-xs text-muted">
                        Adding units back requires inventory permissions.
                      </span>
                    </Field>
                  )}
                  {selected.kind === "exchange" &&
                    selected.status === "inspected" && (
                      <Field label="Replacement order ID">
                        <input
                          name="replacement_order_id"
                          className={inputClass}
                          placeholder="Link the replacement order for this customer"
                          required
                        />
                      </Field>
                    )}
                  <button className={buttonClass} disabled={busy}>
                    Save next step
                  </button>
                </form>
              )}
            {selected.kind === "refund" &&
              selected.status === "inspected" &&
              !refund &&
              can(permissions, "refunds.approve") && (
                <form
                  className="space-y-3 border-t border-line pt-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const f = new FormData(e.currentTarget);
                    void save("returns/" + selected.id + "/refund", {
                      amount: Number(f.get("amount")),
                    });
                  }}
                >
                  <p className="text-sm text-muted">
                    Approve the amount after discounts. Approval reserves the
                    amount; it does not send money.
                  </p>
                  <Field label="Refund amount (BDT)">
                    <input
                      name="amount"
                      type="number"
                      min="0.01"
                      step="0.01"
                      className={inputClass}
                      required
                    />
                  </Field>
                  <button className={buttonClass} disabled={busy}>
                    Approve refund
                  </button>
                </form>
              )}
            {refund?.status === "approved" &&
              can(permissions, "refunds.complete") && (
                <form
                  className="space-y-3 border-t border-line pt-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const f = new FormData(e.currentTarget);
                    void save("returns/" + selected.id + "/refund/complete", {
                      method: f.get("method"),
                      reference: f.get("reference"),
                    });
                  }}
                >
                  <p className="text-sm">
                    Approved amount:{" "}
                    <strong>{formatPrice(refund.amount)}</strong>. Record
                    completion after paying the customer.
                  </p>
                  <Field label="Paid through">
                    <select name="method" className={inputClass}>
                      {["cash", "bank", "bkash", "nagad"].map((s) => (
                        <option key={s} value={s}>
                          {labelFor(s)}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Payment or receipt reference">
                    <input
                      name="reference"
                      minLength={3}
                      maxLength={200}
                      className={inputClass}
                      required
                    />
                  </Field>
                  <button className={buttonClass} disabled={busy}>
                    Record completed refund
                  </button>
                </form>
              )}
            {refund?.status === "completed" && (
              <p className="rounded-xl bg-surface-2 p-3 text-sm">
                Refund completed: {formatPrice(refund.amount)} through{" "}
                {refund.method} · Reference {refund.reference}
              </p>
            )}
          </Panel>
        )}
      </div>
    </>
  );
}
