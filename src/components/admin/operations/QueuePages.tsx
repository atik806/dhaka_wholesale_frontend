"use client";
import { useState } from "react";
import Link from "next/link";
import useSWR, { mutate } from "swr";
import {
  opsGet,
  opsSave,
  type Review,
  type Shipment,
  type Activity,
  type Notification,
} from "@/src/lib/operations-api";
import { formatPrice, formatDate } from "@/src/lib/utils";
import {
  useOpsList,
  PageTitle,
  Panel,
  Pager,
  ListState,
  Field,
  inputClass,
  secondaryClass,
  labelFor,
  ErrorMessage,
} from "./shared";

export function ReviewQueue() {
  const [now] = useState(() => Date.now());
  const [page, setPage] = useState(1),
    [status, setStatus] = useState("awaiting"),
    [assignee, setAssignee] = useState(""),
    [from, setFrom] = useState(""),
    [to, setTo] = useState("");
  const list = useOpsList<Review>("reviews", {
    page,
    status,
    assigned_to: assignee,
    from: from ? new Date(from + "T00:00:00+06:00").toISOString() : undefined,
    to: to
      ? new Date(
          new Date(to + "T00:00:00+06:00").getTime() + 86400000,
        ).toISOString()
      : undefined,
  });
  const { data: assignees } = useSWR("ops-assignees", () =>
    opsGet<{ id: string; name: string }[]>("assignees"),
  );
  const { data: settings } = useSWR("ops-settings", () =>
    opsGet<{ review_after_hours: number }>("settings"),
  );
  return (
    <>
      <PageTitle
        title="Order review"
        description="Confirm customer details and stock before approving an order."
      />
      <Panel title="Review queue">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Review status">
            <select
              className={inputClass}
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              {["", "awaiting", "in_progress", "approved", "rejected"].map(
                (s) => (
                  <option key={s} value={s}>
                    {s ? labelFor(s) : "All statuses"}
                  </option>
                ),
              )}
            </select>
          </Field>
          <Field label="Assigned staff">
            <select
              className={inputClass}
              value={assignee}
              onChange={(e) => {
                setAssignee(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All staff</option>
              {assignees?.data.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Orders from">
            <input
              type="date"
              className={inputClass}
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                setPage(1);
              }}
            />
          </Field>
          <Field label="Orders through">
            <input
              type="date"
              className={inputClass}
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                setPage(1);
              }}
            />
          </Field>
        </div>
        <ListState
          loading={list.loading}
          error={list.error}
          empty={!list.data.length}
        />
        <div className="grid gap-3">
          {!list.loading &&
            list.data.map((r) => (
              <Link
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line p-4 hover:bg-surface-2"
                key={r.order_id}
                href={"/admin/orders/" + r.order_id}
              >
                <div>
                  <p className="font-semibold">
                    #{r.order_id.slice(0, 8)} ·{" "}
                    {r.orders?.shipping_address.firstName}{" "}
                    {r.orders?.shipping_address.lastName}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {labelFor(r.status)} · {r.contact_attempts} contact attempts
                    · {r.orders && formatDate(r.orders.created_at)}
                  </p>
                </div>
                <div className="text-right">
                  <p>{formatPrice(r.orders?.total ?? 0)}</p>
                  {r.orders?.status === "pending" &&
                    now - Date.parse(r.orders.created_at) >
                      (settings?.data.review_after_hours ?? 24) * 3600000 && (
                      <span className="text-sm text-danger">
                        Review overdue
                      </span>
                    )}
                </div>
              </Link>
            ))}
        </div>
        <Pager meta={list.meta} onPage={setPage} />
      </Panel>
    </>
  );
}
export function DeliveryPage() {
  const [page, setPage] = useState(1),
    [status, setStatus] = useState("");
  const list = useOpsList<Shipment>("shipments", { page, status });
  return (
    <>
      <PageTitle
        title="Deliveries"
        description="Track dispatches, delivery attempts, and parcels coming back."
      />
      <Panel title="Shipments">
        <Field label="Shipment status">
          <select
            className={inputClass}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            {[
              "",
              "preparing",
              "dispatched",
              "in_transit",
              "delivered",
              "delivery_failed",
              "returning",
              "returned",
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
          list.data.map((s) => (
            <Link
              key={s.id}
              href={"/admin/orders/" + s.order_id}
              className="block rounded-xl border border-line p-4 hover:bg-surface-2"
            >
              <div className="flex flex-wrap justify-between gap-2">
                <strong>
                  {s.courier} · {s.tracking_number}
                </strong>
                <span>{labelFor(s.status)}</span>
              </div>
              <p className="mt-1 text-sm text-muted">
                Order #{s.order_id.slice(0, 8)} · {s.attempts} failed attempts
                {s.expected_delivery
                  ? " · Expected " + s.expected_delivery
                  : ""}
              </p>
              {s.reason && <p className="mt-2 text-sm">{s.reason}</p>}
            </Link>
          ))}
        <Pager meta={list.meta} onPage={setPage} />
      </Panel>
    </>
  );
}
export function ActivityPage() {
  const [page, setPage] = useState(1),
    [entity, setEntity] = useState(""),
    [actor, setActor] = useState(""),
    [record, setRecord] = useState("");
  const list = useOpsList<Activity>("activity", {
    page,
    entity_type: entity,
    actor_id: actor,
    entity_id: record,
  });
  return (
    <>
      <PageTitle
        title="Activity history"
        description="A permanent record of saved changes. Historical costs and personal details are restricted."
      />
      <Panel title="Activity">
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Area">
            <select
              className={inputClass}
              value={entity}
              onChange={(e) => {
                setEntity(e.target.value);
                setPage(1);
              }}
            >
              {[
                "",
                "orders",
                "order_reviews",
                "order_notes",
                "shipments",
                "products",
                "inventory_variants",
                "return_requests",
                "refunds",
                "admin_access",
                "site_settings",
                "operations_settings",
              ].map((s) => (
                <option key={s} value={s}>
                  {s ? labelFor(s) : "All areas"}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Actor account ID">
            <input
              className={inputClass}
              value={actor}
              onChange={(e) => {
                setActor(e.target.value);
                setPage(1);
              }}
            />
          </Field>
          <Field label="Record ID">
            <input
              className={inputClass}
              value={record}
              onChange={(e) => {
                setRecord(e.target.value);
                setPage(1);
              }}
            />
          </Field>
        </div>
        <ListState
          loading={list.loading}
          error={list.error}
          empty={!list.data.length}
        />
        {!list.loading &&
          list.data.map((a) => (
            <article key={a.id} className="rounded-xl border border-line p-4">
              <div className="flex flex-wrap justify-between gap-2">
                <strong>
                  {labelFor(a.entity_type)} · {a.summary ?? labelFor(a.action)}
                </strong>
                <time className="text-sm text-muted">
                  {new Date(a.created_at).toLocaleString("en-BD", {
                    timeZone: "Asia/Dhaka",
                  })}
                </time>
              </div>
              <p className="mt-2 break-all text-xs text-muted">
                Actor: {a.actor_name ?? a.actor_id ?? "System"} · Record:{" "}
                {a.entity_id}
              </p>
              {a.before_data !== undefined && (
                <details className="mt-3 text-sm">
                  <summary className="cursor-pointer text-link">
                    View change
                  </summary>
                  <div className="mt-3 grid gap-3 lg:grid-cols-2">
                    {[
                      ["Before", a.before_data],
                      ["After", a.after_data],
                    ].map(([label, value]) => (
                      <div key={String(label)}>
                        <p className="mb-1 font-medium">{String(label)}</p>
                        <pre className="max-h-80 overflow-auto rounded-lg bg-surface-2 p-3 text-xs">
                          {JSON.stringify(value, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </article>
          ))}
        <Pager meta={list.meta} onPage={setPage} />
      </Panel>
    </>
  );
}
export function NotificationsPage() {
  const [page, setPage] = useState(1),
    [error, setError] = useState("");
  const list = useOpsList<Notification>("notifications", { page });
  async function read(n: Notification) {
    try {
      await opsSave("notifications/" + n.id + "/read", {});
      list.refresh();
      await mutate("admin-notification-count");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <>
      <PageTitle
        title="Notifications"
        description="New work, assignments, low stock, and items needing follow-up."
      />
      <Panel title="Your notifications">
        <ErrorMessage message={error} />
        <button className={secondaryClass} onClick={list.refresh}>
          Refresh
        </button>
        <ListState
          loading={list.loading}
          error={list.error}
          empty={!list.data.length}
        />
        {!list.loading &&
          list.data.map((n) => (
            <article
              key={n.id}
              className={
                "flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 " +
                (n.notification_reads?.length
                  ? "border-line"
                  : "border-accent/40 bg-accent/5")
              }
            >
              <div>
                <Link className="font-semibold text-link" href={n.href}>
                  {n.title}
                </Link>
                <p className="mt-1 text-xs text-muted">
                  {formatDate(n.created_at)}
                </p>
              </div>
              {!n.notification_reads?.length && (
                <button className={secondaryClass} onClick={() => read(n)}>
                  Mark read
                </button>
              )}
            </article>
          ))}
        <Pager meta={list.meta} onPage={setPage} />
      </Panel>
    </>
  );
}
