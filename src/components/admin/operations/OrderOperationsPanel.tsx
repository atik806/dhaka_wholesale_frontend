"use client";
import { useState, type FormEvent } from "react";
import useSWR from "swr";
import {
  can,
  opsGet,
  opsSave,
  shipmentTransitions,
  type OrderOperations,
  type Review,
  type Shipment,
} from "@/src/lib/operations-api";
import type { Order } from "@/src/lib/admin-api";
import { useAdminAccess } from "./AccessContext";
import {
  Panel,
  Field,
  ErrorMessage,
  inputClass,
  buttonClass,
  secondaryClass,
  labelFor,
} from "./shared";

function formValues(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
  return new FormData(event.currentTarget);
}
type Submit = (
  path: string,
  data: unknown,
  method?: string,
) => Promise<boolean>;
function ReviewForm({
  review,
  assignees,
  submit,
  busy,
}: {
  review: Review;
  assignees: OrderOperations["assignees"];
  submit: Submit;
  busy: boolean;
}) {
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        const f = formValues(e);
        void submit(
          "review",
          {
            version: review.version,
            status: f.get("status"),
            assigned_to: f.get("assigned_to") || null,
            phone_confirmed: f.has("phone_confirmed"),
            address_checked: f.has("address_checked"),
            stock_checked: f.has("stock_checked"),
            contact_attempts: Number(f.get("contact_attempts")),
            reason: f.get("reason"),
          },
          "PATCH",
        );
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Review status">
          <select
            name="status"
            defaultValue={review.status}
            className={inputClass}
          >
            {["awaiting", "in_progress", "approved", "rejected"].map((s) => (
              <option key={s} value={s}>
                {labelFor(s)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Assigned to">
          <select
            name="assigned_to"
            className={inputClass}
            defaultValue={review.assigned_to ?? ""}
          >
            <option value="">Unassigned</option>
            {assignees.map((a) => (
              <option key={a.user_id} value={a.user_id}>
                {a.profiles?.name ?? a.user_id}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className="flex flex-wrap gap-5 text-sm">
        {[
          ["phone_confirmed", "Phone confirmed"],
          ["address_checked", "Address checked"],
          ["stock_checked", "Stock checked"],
        ].map(([key, label]) => (
          <label key={key} className="flex items-center gap-2">
            <input
              type="checkbox"
              name={key}
              defaultChecked={Boolean(review[key as keyof Review])}
            />
            {label}
          </label>
        ))}
      </div>
      <Field label="Contact attempts">
        <input
          name="contact_attempts"
          type="number"
          min="0"
          max="1000"
          className={inputClass}
          defaultValue={review.contact_attempts}
          required
        />
      </Field>
      <Field label="Review or cancellation reason">
        <textarea
          name="reason"
          maxLength={2000}
          className={inputClass}
          defaultValue={review.reason ?? ""}
        />
      </Field>
      <button className={buttonClass} disabled={busy}>
        Save review
      </button>
    </form>
  );
}
function ShipmentForm({
  shipment,
  submit,
  busy,
}: {
  shipment: Shipment | null;
  submit: Submit;
  busy: boolean;
}) {
  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        const f = formValues(e);
        void submit(
          "shipment",
          {
            version: shipment?.version ?? 0,
            courier: f.get("courier"),
            tracking_number: f.get("tracking_number"),
            tracking_url: f.get("tracking_url") || null,
            status: f.get("status"),
            expected_delivery: f.get("expected_delivery") || null,
            actual_cost:
              f.get("actual_cost") === "" ? null : Number(f.get("actual_cost")),
            reason: f.get("reason"),
          },
          "PATCH",
        );
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Courier">
          <input
            name="courier"
            className={inputClass}
            maxLength={100}
            defaultValue={shipment?.courier}
            required
          />
        </Field>
        <Field label="Tracking number">
          <input
            name="tracking_number"
            className={inputClass}
            maxLength={200}
            defaultValue={shipment?.tracking_number}
            required
          />
        </Field>
        <Field label="Tracking URL">
          <input
            type="url"
            name="tracking_url"
            className={inputClass}
            defaultValue={shipment?.tracking_url ?? ""}
          />
        </Field>
        <Field label="Shipment status">
          <select
            name="status"
            defaultValue={shipment?.status ?? "preparing"}
            className={inputClass}
          >
            {[
              shipment?.status ?? "preparing",
              ...(shipment ? (shipmentTransitions[shipment.status] ?? []) : []),
            ].map((s) => (
              <option key={s} value={s}>
                {labelFor(s)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Expected delivery">
          <input
            type="date"
            name="expected_delivery"
            className={inputClass}
            defaultValue={shipment?.expected_delivery ?? ""}
          />
        </Field>
        <Field label="Actual delivery cost (BDT)">
          <input
            type="number"
            name="actual_cost"
            min="0"
            step="0.01"
            className={inputClass}
            defaultValue={shipment?.actual_cost ?? ""}
          />
        </Field>
      </div>
      <Field label="Delivery notes or failure reason">
        <textarea
          name="reason"
          className={inputClass}
          maxLength={2000}
          defaultValue={shipment?.reason ?? ""}
        />
      </Field>
      <button disabled={busy} className={buttonClass}>
        Save shipment
      </button>
    </form>
  );
}
export function OrderOperationsPanel({
  order,
  onChanged,
}: {
  order: Order;
  onChanged: () => void;
}) {
  const { permissions, user_id } = useAdminAccess();
  const { data, error, mutate } = useSWR(
    "order-operations:" + order.id,
    () => opsGet<OrderOperations>("order/" + order.id),
    { revalidateOnFocus: false },
  );
  const [busy, setBusy] = useState(false),
    [saveError, setSaveError] = useState(""),
    [success, setSuccess] = useState("");
  const ops = data?.data;
  const submit: Submit = async (path, payload, method = "POST") => {
    setBusy(true);
    setSaveError("");
    setSuccess("");
    try {
      await opsSave("order/" + order.id + "/" + path, payload, method);
      await mutate();
      onChanged();
      setSuccess("Saved successfully.");
      return true;
    } catch (e) {
      setSaveError((e as Error).message);
      return false;
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="mb-6 space-y-6">
      <ErrorMessage message={saveError || (error as Error)?.message || ""} />
      {success && (
        <p role="status" className="text-sm text-success">
          {success}
        </p>
      )}
      {!ops && !error && (
        <p role="status" className="text-sm text-muted">
          Loading order workspace…
        </p>
      )}
      {ops && (
        <>
          <Panel title="Order review">
            {order.status === "pending" && can(permissions, "orders.manage") ? (
              <ReviewForm
                key={ops.review.version}
                review={ops.review}
                assignees={ops.assignees}
                submit={submit}
                busy={busy}
              />
            ) : (
              <p className="text-sm text-muted">
                {labelFor(ops.review.status)} · {ops.review.contact_attempts}{" "}
                contact attempts
                {ops.review.reason ? " · " + ops.review.reason : ""}
              </p>
            )}
          </Panel>
          {["pending", "confirmed"].includes(order.status) &&
            can(permissions, "orders.manage") && (
              <Panel title="Cancel order">
                <form
                  className="space-y-3"
                  onSubmit={(e) => {
                    const f = formValues(e);
                    void submit("cancel", {
                      expected_status: order.status,
                      reason: f.get("reason"),
                    });
                  }}
                >
                  <Field label="Cancellation reason">
                    <textarea
                      name="reason"
                      maxLength={2000}
                      className={inputClass}
                      required
                    />
                  </Field>
                  <p className="text-xs text-muted">
                    Cancelling releases the reserved stock and cannot be undone.
                  </p>
                  <button className={secondaryClass} disabled={busy}>
                    Cancel order and restore stock
                  </button>
                </form>
              </Panel>
            )}
          <div className="grid gap-6 xl:grid-cols-2">
            <Panel title="Private staff notes">
              <div className="max-h-72 space-y-3 overflow-auto">
                {ops.notes.length ? (
                  ops.notes.map((n) => (
                    <article
                      key={n.id}
                      className="rounded-xl bg-surface-2 p-3 text-sm"
                    >
                      <p className="whitespace-pre-wrap">{n.text}</p>
                      <time className="mt-1 block text-xs text-muted">
                        {new Date(n.created_at).toLocaleString()}
                      </time>
                    </article>
                  ))
                ) : (
                  <p className="text-sm text-muted">No notes yet.</p>
                )}
              </div>
              {(can(permissions, "orders.notes") ||
                can(permissions, "orders.manage")) && (
                <form
                  onSubmit={async (e) => {
                    const form = e.currentTarget;
                    const f = formValues(e);
                    if (await submit("notes", { text: f.get("text") }))
                      form.reset();
                  }}
                  className="space-y-2"
                >
                  <Field label="Add an internal note">
                    <textarea
                      name="text"
                      className={inputClass}
                      maxLength={2000}
                      required
                    />
                  </Field>
                  <button disabled={busy} className={buttonClass}>
                    Add note
                  </button>
                </form>
              )}
            </Panel>
            <Panel title="Delivery tracking">
              {can(permissions, "shipments.manage") &&
              ["confirmed", "shipped", "delivered"].includes(order.status) ? (
                <ShipmentForm
                  key={ops.shipment?.version ?? 0}
                  shipment={ops.shipment}
                  submit={submit}
                  busy={busy}
                />
              ) : (
                <p className="text-sm text-muted">
                  {ops.shipment
                    ? ops.shipment.courier +
                      " · " +
                      ops.shipment.tracking_number +
                      " · " +
                      labelFor(ops.shipment.status)
                    : "Confirm the order before preparing a shipment."}
                </p>
              )}
            </Panel>
          </div>
          {(order.status === "delivered" ||
            ops.shipment?.status === "returned") &&
            can(permissions, "returns.request") && (
              <Panel title="Create a return or exchange">
                <form
                  className="space-y-3"
                  onSubmit={(e) => {
                    const f = formValues(e);
                    void submit("returns", {
                      order_item_id: f.get("order_item_id"),
                      quantity: Number(f.get("quantity")),
                      kind: f.get("kind"),
                      reason: f.get("reason"),
                      photos: String(f.get("photos") ?? "")
                        .split("\n")
                        .map((s) => s.trim())
                        .filter(Boolean),
                      override_window: f.has("override_window"),
                    });
                  }}
                >
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Field label="Item">
                      <select
                        name="order_item_id"
                        className={inputClass}
                        required
                      >
                        {order.order_items?.map((i) => (
                          <option key={i.id} value={i.id}>
                            {i.product_name} {i.selected_size}{" "}
                            {i.selected_color} · bought {i.quantity}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Quantity">
                      <input
                        name="quantity"
                        type="number"
                        min="1"
                        max="999"
                        defaultValue="1"
                        className={inputClass}
                        required
                      />
                    </Field>
                    <Field label="Resolution">
                      <select name="kind" className={inputClass}>
                        <option value="refund">Refund</option>
                        <option value="exchange">Exchange</option>
                      </select>
                    </Field>
                  </div>
                  <Field label="Reason">
                    <textarea
                      name="reason"
                      maxLength={2000}
                      className={inputClass}
                      required
                    />
                  </Field>
                  <Field label="Photo links (optional, one per line)">
                    <textarea name="photos" className={inputClass} />
                  </Field>
                  {can(permissions, "*") && (
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" name="override_window" />
                      Allow an exception to the{" "}
                      {ops.settings.return_window_days}-day return window
                    </label>
                  )}
                  <button disabled={busy} className={buttonClass}>
                    Create return request
                  </button>
                </form>
              </Panel>
            )}
          <Panel title="Order activity">
            <button className={secondaryClass} onClick={() => void mutate()}>
              Refresh workspace
            </button>
            {ops.activity.length ? (
              <ol className="space-y-3">
                {ops.activity.map((a) => (
                  <li
                    key={a.id}
                    className="border-l-2 border-line pl-3 text-sm"
                  >
                    <p>
                      {labelFor(a.entity_type)} ·{" "}
                      {a.summary ?? labelFor(a.action)}
                    </p>
                    <p className="text-xs text-muted">
                      {new Date(a.created_at).toLocaleString()} ·{" "}
                      {a.actor_id === user_id
                        ? "You"
                        : a.actor_id
                          ? (a.actor_name ?? "Staff")
                          : "System"}
                    </p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-muted">No activity recorded.</p>
            )}
          </Panel>
        </>
      )}
    </div>
  );
}
