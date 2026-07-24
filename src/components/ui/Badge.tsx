import { cn } from "@/src/lib/utils";
import type { ReactNode } from "react";

type BadgeVariant =
  | "sale"
  | "new"
  | "out-of-stock"
  | "low-stock"
  | "neutral"
  | "success"
  | "info"
  | "accent";

interface BadgeProps {
  variant?: BadgeVariant;
  children?: ReactNode;
  className?: string;
}

const styles: Record<BadgeVariant, string> = {
  sale: "bg-sale text-sale-fg",
  new: "bg-brand text-brand-fg",
  "out-of-stock": "bg-surface-3 text-muted",
  "low-stock": "bg-accent-soft text-accent-fg border border-accent/40",
  neutral: "bg-surface-2 text-muted border border-line",
  success: "bg-success-soft text-success border border-success/30",
  info: "bg-info-soft text-info border border-info/30",
  accent: "bg-accent text-accent-fg",
};

export function Badge({ variant = "new", children, className }: BadgeProps) {
  if (!children) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[11px] font-bold tracking-wide leading-5",
        styles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
