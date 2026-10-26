"use client";
import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { opsSave, type AccessRecord } from "@/src/lib/operations-api";
import { fetchAllStaff } from "@/src/lib/admin-api";
import { useConfirm } from "@/src/components/admin/ConfirmDialog";
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
const groups = [
  ["owner", "Full access, including staff permissions"],
  ["orders", "Review orders and manage shipments"],
  ["inventory", "Manage products, SKUs, stock, and costs"],
  ["support", "Customer lookup, notes, and return requests"],
  ["finance", "Approve/record refunds and view financial reports"],
];
export function AccessPage() {
  const [page, setPage] = useState(1),
    [search, setSearch] = useState(""),
    [selected, setSelected] = useState<AccessRecord | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const list = useOpsList<AccessRecord>("access", { page, search });
  const { data: staff } = useSWR("staff-directory-access", fetchAllStaff);
  const { confirm, dialog } = useConfirm();
  return (
    <>
      {dialog}
      <PageTitle
        title="Staff access"
        description="Link login accounts to staff records and grant only the access each person needs."
      />
      <div className="space-y-6">
        <Panel title="Login accounts">
          <p className="text-sm text-muted">
            Create accounts in{" "}
            <Link className="text-link underline" href="/admin/users">
              Users
            </Link>
            . Staff directory availability is separate from login access.
          </p>
          <Field label="Search accounts">
            <input
              className={inputClass}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Account name"
            />
          </Field>
          <ListState
            loading={list.loading}
            error={list.error}
            empty={!list.data.length}
          />
          {!list.loading &&
            list.data.map((u) => (
              <article
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line p-4"
                key={u.id}
              >
                <div>
                  <p className="font-semibold">{u.name}</p>
                  <p className="text-sm text-muted">{u.email}</p>
                  <p className="mt-1 text-xs text-muted">
                    {u.admin_access?.enabled
                      ? u.admin_access.groups.map(labelFor).join(", ")
                      : "No active admin access"}
                  </p>
                </div>
                <button
                  className={secondaryClass}
                  onClick={() => {
                    setSelected(u);
                    setError("");
                  }}
                >
                  Manage access
                </button>
              </article>
            ))}
          <Pager meta={list.meta} onPage={setPage} />
        </Panel>
        {selected && (
          <Panel key={selected.id} title={selected.name + " · Permissions"}>
            <button
              className={secondaryClass}
              disabled={busy}
              onClick={() => setSelected(null)}
            >
              Close
            </button>
            <ErrorMessage message={error} />
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                const payload = {
                  version: selected.admin_access?.version ?? 0,
                  staff_id: f.get("staff_id") || null,
                  enabled: f.has("enabled"),
                  groups: f.getAll("groups"),
                };
                if (
                  !(await confirm(
                    "Change staff access",
                    `Save ${payload.enabled ? "enabled" : "disabled"} admin access for ${selected.name}? Selected groups: ${payload.groups.join(", ") || "none"}.`,
                    {
                      confirmLabel: "Save access",
                      danger:
                        !payload.enabled || payload.groups.includes("owner"),
                    },
                  ))
                )
                  return;
                setBusy(true);
                setError("");
                try {
                  await opsSave("access/" + selected.id, payload, "PATCH");
                  list.refresh();
                  setSelected(null);
                  window.dispatchEvent(new Event("admin-access-changed"));
                } catch (e) {
                  setError((e as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  name="enabled"
                  defaultChecked={selected.admin_access?.enabled ?? true}
                />
                Enable admin access
              </label>
              <Field label="Linked staff directory record">
                <select
                  name="staff_id"
                  className={inputClass}
                  defaultValue={selected.admin_access?.staff_id ?? ""}
                >
                  <option value="">No staff record linked</option>
                  {staff?.map((s) => (
                    <option value={s.id} key={s.id}>
                      {s.name} · {s.job_title}
                    </option>
                  ))}
                </select>
              </Field>
              <fieldset className="space-y-3">
                <legend className="mb-3 text-sm font-semibold">
                  Permission groups
                </legend>
                {groups.map(([value, description]) => (
                  <label
                    key={value}
                    className="flex items-start gap-3 rounded-xl border border-line p-3"
                  >
                    <input
                      type="checkbox"
                      name="groups"
                      value={value}
                      defaultChecked={selected.admin_access?.groups.includes(
                        value,
                      )}
                      className="mt-1"
                    />
                    <span>
                      <strong className="text-sm">{labelFor(value)}</strong>
                      <span className="block text-xs text-muted">
                        {description}
                      </span>
                    </span>
                  </label>
                ))}
              </fieldset>
              <p className="text-xs text-muted">
                At least one active owner must remain. Disabling access takes
                effect on the next protected request.
              </p>
              <button className={buttonClass} disabled={busy}>
                Save access
              </button>
            </form>
          </Panel>
        )}
      </div>
    </>
  );
}
