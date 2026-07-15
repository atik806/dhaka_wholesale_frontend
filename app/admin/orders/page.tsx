"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchOrders, deleteOrder } from "@/src/lib/admin-api";
import { DataTable, type Column } from "@/src/components/admin/DataTable";
import { StatusBadge } from "@/src/components/admin/StatusBadge";
import { formatPrice, formatDate } from "@/src/lib/utils";
import { Trash2 } from "lucide-react";
import type { Order } from "@/src/lib/admin-api";

const statusFilters = ["All", "Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"];

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);

  const handleFilterChange = (filter: string) => {
    setStatusFilter(filter);
    setPage(1);
  };

  const handleDelete = async (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to permanently delete this order? This action cannot be undone.")) return;
    try {
      await deleteOrder(orderId);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      setMeta((prev) => ({ ...prev, total: prev.total - 1 }));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete order");
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const params: { page: number; limit: number; status?: string } = { page, limit: 20 };
        if (statusFilter !== "All") params.status = statusFilter.toLowerCase();
        const result = await fetchOrders(params);
        if (active) { setOrders(result.orders); setMeta(result.meta); }
      } catch { if (active) setOrders([]); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [page, statusFilter]);

  const columns: Column<Order>[] = [
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
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold">Orders</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Manage customer orders</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {statusFilters.map((s) => (
          <button
            key={s}
            onClick={() => handleFilterChange(s)}
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
        data={orders}
        keyExtractor={(o) => o.id}
        onRowClick={(order) => router.push(`/admin/orders/${order.id}`)}
        pagination={{
          page: meta.page,
          totalPages: meta.totalPages,
          onPageChange: setPage,
        }}
        loading={loading}
      />
    </div>
  );
}
