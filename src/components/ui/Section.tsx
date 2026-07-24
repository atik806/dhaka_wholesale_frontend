import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/src/lib/utils";
import type { ReactNode } from "react";

interface SectionHeaderProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  href?: string;
  linkLabel?: string;
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  href,
  linkLabel = "View all",
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("flex items-end justify-between gap-6 mb-6", className)}>
      <div className="min-w-0">
        {eyebrow && <p className="label-caps text-accent-hover mb-1.5">{eyebrow}</p>}
        <h2 className="text-2xl sm:text-3xl font-bold text-fg">{title}</h2>
        {description && (
          <p className="text-sm text-muted mt-1.5 max-w-2xl leading-relaxed">{description}</p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="hidden sm:inline-flex items-center gap-1.5 shrink-0 text-sm font-semibold text-brand hover:text-accent-hover transition-colors"
        >
          {linkLabel}
          <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}

export function Section({
  children,
  className,
  muted = false,
}: {
  children: ReactNode;
  className?: string;
  muted?: boolean;
}) {
  return (
    <section className={cn("py-10 sm:py-14", muted && "bg-surface-2", className)}>
      <div className="container">{children}</div>
    </section>
  );
}
