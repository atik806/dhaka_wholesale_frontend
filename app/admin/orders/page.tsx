"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { fetchOrders, deleteOrder } from "@/src/lib/admin-api";
import { DataTable, type Column } from "@/src/components/admin/DataTable";
import { StatusBadge } from "@/src/components/admin/StatusBadge";
import { useConfirm } from "@/src/components/admin/ConfirmDialog";
import { formatPrice, formatDate } from "@/src/lib/utils";
import { Trash2 } from "lucide-react";
import { useRealtimeData } from "@/src/hooks/useRealtimeData";
import { useToast } from "@/src/providers/ToastProvider";
import type { Order } from "@/src/lib/admin-api";

const statusFilters = ["All", "Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"];

export default function OrdersPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { confirm, dialog } = useConfirm();
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");

  const { data: orders, loading } = useRealtimeData<Order>({
    table: "orders",
    initialFetch: useCallback(async () => {
      const result = await fetchOrders({ page: 1, limit: 100 });
      return result.orders;
    }, []),
  });

  const filtered = useMemo(() => {
    let list = orders;
    if (statusFilter !== "All") {
      list = list.filter((o) => o.status === statusFilter.toLowerCase());
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((o) => {
        const addr = o.shipping_address as Record<string, string> | undefined;
        const name = addr?.firstName && addr?.lastName
          ? `${addr.firstName} ${addr.lastName}`.toLowerCase()
          : (o.profiles?.name || "").toLowerCase();
        return name.includes(q) || o.id.toLowerCase().includes(q);
      });
    }
    return list;
  }, [orders, statusFilter, search]);

  const handleDelete = useCallback(async (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation();
    const ok = await confirm(
      "Delete Order",
      "Are you sure you want to permanently delete this order? This action cannot be undone.",
      { confirmLabel: "Delete", danger: true }
    );
    if (!ok) return;
    try {
      await deleteOrder(orderId);
      addToast("Order deleted", "success");
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to delete order", "error");
    }
  }, [confirm, addToast]);

  const columns: Column<Order>[] = useMemo(() => [
    {
      key: "id",
      label: "Order ID",
      render: (order) => <span className="font-mono text-xs">#{order.id.slice(0, 8)}</span>,
    },
    {
      key: "customer",
      label: "Customer",
      render: (order) => {
        const addr = order.shipping_address as Record<string, string> | undefined;
        if (addr?.firstName && addr?.lastName) return `${addr.firstName} ${addr.lastName}`;
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
      render: (order) => <span className="text-zinc-500 dark:text-zinc-400 text-xs">{formatDate(order.created_at)}</span>,
    },
    {
      key: "actions",
      label: "",
      render: (order) => (
        <button
          onClick={(e) => handleDelete(e, order.id)}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          title="Delete order"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ], []);

  return (
    <div>
      {dialog}
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold">Orders</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Manage customer orders &mdash; <span className="text-primary font-medium">{filtered.length}</span> shown</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {statusFilters.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-colors ${
              statusFilter === s
                ? "bg-primary text-white"
                : "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <DataTable<Order>
        columns={columns}
        data={filtered}
        keyExtractor={(o) => o.id}
        onRowClick={(order) => router.push(`/admin/orders/${order.id}`)}
        searchable
        searchValue={search}
        onSearchChange={setSearch}
        loading={loading}
        mobileCard={(order) => (
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">#{order.id.slice(0, 8)}</span>
                <StatusBadge status={order.status} />
              </div>
              <p className="text-sm font-medium truncate">
                {(() => {
                  const addr = order.shipping_address as Record<string, string> | undefined;
                  if (addr?.firstName && addr?.lastName) return `${addr.firstName} ${addr.lastName}`;
                  return order.profiles?.name || "—";
                })()}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-medium">{formatPrice(order.total)}</span>
                <StatusBadge status={order.payment_status} />
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{formatDate(order.created_at)}</p>
            </div>
            <button
              onClick={(e) => handleDelete(e, order.id)}
              className="p-2 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      />
    </div>
  );
}
