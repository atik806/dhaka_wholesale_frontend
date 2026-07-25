import { cn } from "@/src/lib/utils";

const statusStyles: Record<string, string> = {
  pending: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
  confirmed: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
  shipped: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300",
  delivered: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
  cancelled: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
  paid: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
  failed: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
  refunded: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
  customer: "bg-zinc-100 dark:bg-zinc-800 text-muted",
  admin: "bg-primary/10 text-link",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize", statusStyles[status] || "bg-surface-2 text-muted")}>
      {status}
    </span>
  );
}
