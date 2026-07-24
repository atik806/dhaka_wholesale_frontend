import { cn } from "@/src/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Adds hover elevation — use for clickable cards only */
  interactive?: boolean;
  padded?: boolean;
}

export function Card({
  children,
  className,
  interactive = false,
  padded = false,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "bg-surface border border-line rounded-lg",
        padded && "p-5 sm:p-6",
        interactive &&
          "transition-shadow duration-200 hover:shadow-md hover:border-line-strong",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
  action,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 px-5 sm:px-6 py-4 border-b border-line",
        className,
      )}
    >
      <div className="min-w-0">
        <h3 className="text-base font-bold text-fg truncate">{title}</h3>
        {description && <p className="text-[13px] text-muted mt-0.5">{description}</p>}
      </div>
      {action}
    </div>
  );
}
