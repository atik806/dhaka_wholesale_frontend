"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Package, ShoppingCart, Users, DollarSign, AlertTriangle, ArrowUpRight,
  Clock, Mail, Calendar,
} from "lucide-react";
import { fetchDashboard, type DashboardStats } from "@/src/lib/admin-api";
import { StatsCard } from "@/src/components/admin/StatsCard";
import { StatusBadge } from "@/src/components/admin/StatusBadge";
import { RevenueChart } from "@/src/components/admin/RevenueChart";
import { formatPrice, formatDate } from "@/src/lib/utils";
import { useRealtimeInvalidate } from "@/src/hooks/useRealtimeInvalidate";

const dateRanges = [
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
  { label: "All Time", value: "all" },
];

function buildRangeParams(range: string): { from?: string; to?: string } {
  const params: { from?: string; to?: string } = {};
  if (range !== "all") {
    const days = range === "7d" ? 7 : 30;
    const from = new Date();
    from.setDate(from.getDate() - days);
    params.from = from.toISOString();
  }
  return params;
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("30d");

  const loadData = useCallback(async (range: string) => {
    try {
      const result = await fetchDashboard(buildRangeParams(range));
      setData(result);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const result = await fetchDashboard(buildRangeParams(dateRange));
        if (active) setData(result);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [dateRange]);

  useRealtimeInvalidate({ table: "orders", onInvalidate: () => loadData(dateRange) });
  useRealtimeInvalidate({ table: "products", onInvalidate: () => loadData(dateRange) });
  useRealtimeInvalidate({ table: "contact_messages", onInvalidate: () => loadData(dateRange) });

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  const stats = [
    { title: "Total Products", value: data?.stats.totalProducts ?? 0, icon: Package, color: "text-emerald-500" },
    { title: "Total Orders", value: data?.stats.totalOrders ?? 0, icon: ShoppingCart, color: "text-blue-500" },
    { title: "Total Users", value: data?.stats.totalUsers ?? 0, icon: Users, color: "text-purple-500" },
    { title: "Revenue", value: formatPrice(data?.stats.totalRevenue ?? 0), icon: DollarSign, color: "text-amber-500" },
    { title: "Pending Orders", value: data?.stats.pendingOrders ?? 0, icon: Clock, color: "text-orange-500" },
    { title: "Unread Messages", value: data?.stats.unreadMessages ?? 0, icon: Mail, color: "text-cyan-500" },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted mt-1">Overview of your store</p>
        </div>
        <div className="flex items-center flex-wrap gap-1 bg-surface border border-line rounded-xl p-1">
          {dateRanges.map((r) => (
            <button
              key={r.value}
              onClick={() => setDateRange(r.value)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                dateRange === r.value
                  ? "bg-brand text-brand-fg"
                  : "text-muted hover:text-fg"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {stats.map((s, i) => (
          <StatsCard key={s.title} {...s} index={i} />
        ))}
      </div>

      {/* Revenue Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-surface rounded-2xl border border-line p-4 sm:p-6 mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Revenue Trend</h2>
          <span className="text-xs text-muted flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Last {dateRange === "all" ? "30" : dateRange === "7d" ? "7" : "30"} days
          </span>
        </div>
        <RevenueChart data={data?.revenueData ?? []} />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-surface rounded-2xl border border-line p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm text-link hover:text-link-hover flex items-center gap-1">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {(data?.recentOrders ?? []).length === 0 ? (
              <p className="text-sm text-muted">No orders yet</p>
            ) : (
              (data?.recentOrders ?? []).map((order) => { const o = order as Record<string, unknown>; return (
                <div key={String(o.id ?? "")} className="flex items-center justify-between py-2 border-b border-line/50 last:border-0">
                  <div>
                    <p className="text-sm font-medium">#{String(o.id ?? "").slice(0, 8)}</p>
                    <p className="text-xs text-muted">{formatDate(o.created_at as string)}</p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={o.status as string} />
                    <p className="text-sm font-medium mt-1">{formatPrice(o.total as number)}</p>
                  </div>
                </div>
              ); })
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-surface rounded-2xl border border-line p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Low Stock Products</h2>
            <Link href="/admin/products" className="text-sm text-link hover:text-link-hover flex items-center gap-1">
              Manage <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {(data?.lowStockProducts ?? []).length === 0 ? (
              <p className="text-sm text-muted">All products are well stocked</p>
            ) : (
              (data?.lowStockProducts ?? []).map((product) => { const p = product as Record<string, unknown>; return (
                <div key={String(p.id ?? "")} className="flex items-center justify-between py-2 border-b border-line/50 last:border-0">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{String(p.name ?? "")}</p>
                      <p className="text-xs text-muted capitalize">{String(p.stock ?? "")}</p>
                    </div>
                  </div>
                  <p className="text-sm font-medium">{formatPrice(p.price as number)}</p>
                </div>
              ); })
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
