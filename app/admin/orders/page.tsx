"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { fetchOrders, deleteOrder } from "@/src/lib/admin-api";
import { DataTable, type Column } from "@/src/components/admin/DataTable";
import { StatusBadge } from "@/src/components/admin/StatusBadge";
import { useConfirm } from "@/src/components/admin/ConfirmDialog";
import { formatPrice, formatDate } from "@/src/lib/utils";
import { Trash2 } from "lucide-react";
import useSWR from "swr";
import { useAdminAccess } from "@/src/components/admin/operations/AccessContext";
import { can } from "@/src/lib/operations-api";
import { ErrorMessage } from "@/src/components/admin/operations/shared";
import { useToast } from "@/src/providers/ToastProvider";
import type { Order } from "@/src/lib/admin-api";

const statusFilters = [
  "All",
  "Pending",
  "Confirmed",
  "Shipped",
  "Delivered",
  "Cancelled",
];

export default function OrdersPage() {
  const router = useRouter();
  const { permissions } = useAdminAccess();
  const [page, setPage] = useState(1);
  const { addToast } = useToast();
  const { confirm, dialog } = useConfirm();
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");

  const {
    data: result,
    error,
    isLoading: loading,
    mutate,
  } = useSWR(
    ["admin-orders", page, statusFilter, search],
    () =>
      fetchOrders({
        page,
        limit: 25,
        status: statusFilter === "All" ? undefined : statusFilter.toLowerCase(),
        search,
      }),
    { refreshInterval: 30000 },
  );
  const filtered = result?.orders ?? [];

  const handleDelete = useCallback(
    async (e: React.MouseEvent, orderId: string) => {
      e.stopPropagation();
      const ok = await confirm(
        "Archive Order",
        "Are you sure you want to archive this order? Pending orders will be cancelled and their stock restored. History is retained.",
        { confirmLabel: "Archive", danger: true },
      );
      if (!ok) return;
      try {
        await deleteOrder(orderId);
        addToast("Order archived", "success");
        await mutate();
      } catch (err) {
        addToast(
          err instanceof Error ? err.message : "Failed to archive order",
          "error",
        );
      }
    },
    [confirm, addToast, mutate],
  );

  const columns: Column<Order>[] = useMemo(
    () => [
      {
        key: "id",
        label: "Order ID",
        render: (order) => (
          <span className="font-mono text-xs">#{order.id.slice(0, 8)}</span>
        ),
      },
      {
        key: "customer",
        label: "Customer",
        render: (order) => {
          const addr = order.shipping_address as
            Record<string, string> | undefined;
          if (addr?.firstName && addr?.lastName)
            return `${addr.firstName} ${addr.lastName}`;
          return order.profiles?.name || "—";
        },
      },
      {
        key: "total",
        label: "Total",
        render: (order) => formatPrice(order.total),
      },
      {
        key: "status",
        label: "Status",
        render: (order) => <StatusBadge status={order.status} />,
      },
      {
        key: "payment_status",
        label: "Payment",
        render: (order) => <StatusBadge status={order.payment_status} />,
      },
      {
        key: "created_at",
        label: "Date",
        render: (order) => (
          <span className="text-muted text-xs">
            {formatDate(order.created_at)}
          </span>
        ),
      },
      {
        key: "actions",
        label: "",
        render: (order) => (
          <button
            onClick={(e) => handleDelete(e, order.id)}
            disabled={!can(permissions, "*")}
            className="p-1.5 rounded-lg text-muted hover:text-red-500 hover:bg-danger-soft transition-colors"
            title="Archive order"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        ),
      },
    ],
    [handleDelete, permissions],
  );

  return (
    <div>
      {dialog}
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold">Orders</h1>
        <p className="text-sm text-muted mt-1">
          Manage customer orders &mdash;{" "}
          <span className="text-link font-medium">{filtered.length}</span> shown
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {statusFilters.map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatusFilter(s);
              setPage(1);
            }}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-colors ${
              statusFilter === s
                ? "bg-accent text-accent-fg"
                : "bg-surface border border-line text-muted hover:bg-zinc-50 dark:hover:bg-zinc-700"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <ErrorMessage message={(error as Error)?.message ?? ""} />
      <DataTable<Order>
        columns={columns}
        data={filtered}
        keyExtractor={(o) => o.id}
        onRowClick={(order) => router.push(`/admin/orders/${order.id}`)}
        searchable
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        pagination={{
          page,
          totalPages: result?.meta.totalPages ?? 0,
          onPageChange: setPage,
        }}
        loading={loading}
        mobileCard={(order) => (
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs text-muted">
                  #{order.id.slice(0, 8)}
                </span>
                <StatusBadge status={order.status} />
              </div>
              <p className="text-sm font-medium truncate">
                {(() => {
                  const addr = order.shipping_address as
                    Record<string, string> | undefined;
                  if (addr?.firstName && addr?.lastName)
                    return `${addr.firstName} ${addr.lastName}`;
                  return order.profiles?.name || "—";
                })()}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-medium">
                  {formatPrice(order.total)}
                </span>
                <StatusBadge status={order.payment_status} />
              </div>
              <p className="text-xs text-muted mt-1">
                {formatDate(order.created_at)}
              </p>
            </div>
            <button
              onClick={(e) => handleDelete(e, order.id)}
              disabled={!can(permissions, "*")}
              className="p-2 rounded-lg text-muted hover:text-red-500 hover:bg-danger-soft transition-colors shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      />
    </div>
  );
}
