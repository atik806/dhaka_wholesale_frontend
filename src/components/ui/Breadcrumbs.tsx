"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center gap-1 text-[13px] text-muted mb-5 flex-wrap ${className ?? ""}`}
    >
      <Link href="/" className="hover:text-accent-hover transition-colors">
        Home
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1 min-w-0">
          <ChevronRight className="w-3.5 h-3.5 text-subtle shrink-0" />
          {item.href ? (
            <Link href={item.href} className="hover:text-accent-hover transition-colors truncate">
              {item.label}
            </Link>
          ) : (
            <span className="text-fg font-semibold truncate">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
