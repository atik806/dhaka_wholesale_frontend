"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { formatPrice } from "@/src/lib/utils";

interface RevenueChartProps {
  data: { date: string; revenue: number; orders: number }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const chartData = useMemo(
    () =>
      data.map((d) => ({
        ...d,
        label: new Date(d.date + "T00:00:00").toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
      })),
    [data]
  );

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-zinc-500 dark:text-zinc-400">
        No data available
      </div>
    );
  }

  return (
    <div className="h-[200px] sm:h-[250px] md:h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary, #059669)" stopOpacity={0.3} />
            <stop offset="100%" stopColor="var(--color-primary, #059669)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,120,120,0.1)" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "#a1a1aa" }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#a1a1aa" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`}
          width={50}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(24,24,27,0.95)",
            border: "none",
            borderRadius: "12px",
            padding: "10px 14px",
            fontSize: "13px",
            color: "#fafafa",
          }}
          formatter={(value, name) =>
            name === "revenue" ? [formatPrice(Number(value)), "Revenue"] : [String(value), "Orders"]
          }
          labelStyle={{ color: "#a1a1aa", fontSize: "11px" }}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="var(--color-primary, #059669)"
          strokeWidth={2}
          fill="url(#revenueGrad)"
        />
      </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
