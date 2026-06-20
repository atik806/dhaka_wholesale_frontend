import { cn } from "@/src/lib/utils";

interface BadgeProps {
  variant?: "sale" | "new" | "out-of-stock" | "low-stock";
  children?: string;
}

const styles: Record<string, string> = {
  sale: "bg-rose-500 text-white",
  new: "bg-emerald-500 text-white",
  "out-of-stock": "bg-zinc-800 dark:bg-zinc-700 text-white",
  "low-stock": "bg-amber-500 text-white",
};

export function Badge({ variant = "new", children }: BadgeProps) {
  if (!children) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide uppercase",
        styles[variant]
      )}
    >
      {children}
    </span>
  );
}
