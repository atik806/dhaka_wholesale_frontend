"use client";
import Link from "next/link";
import useSWR from "swr";
import { Bell } from "lucide-react";
import {
  opsGet,
  type Notification,
  type PageMeta,
} from "@/src/lib/operations-api";
export function NotificationBell() {
  const { data, error } = useSWR(
    "admin-notification-count",
    () => opsGet<Notification[]>("notifications", { limit: 1 }),
    { refreshInterval: 30000 },
  );
  const unread = (data?.meta as PageMeta | undefined)?.unread ?? 0;
  return (
    <Link
      href="/admin/notifications"
      className="relative flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 text-sm"
      aria-label={
        error ? "Notifications unavailable" : `Notifications: ${unread} unread`
      }
    >
      <Bell className="h-4 w-4" />
      <span>Notifications</span>
      {unread > 0 && (
        <span className="rounded-full bg-danger px-2 text-xs text-white">
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </Link>
  );
}
