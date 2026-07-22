"use client";

import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-1.5 font-mono text-xs text-[#132A3A]/70 dark:text-[#a0b4c4] mb-6 flex-wrap bg-[#FBF6EC] dark:bg-[#0D1F2C] border border-[#E7DCC4] dark:border-[#2a3d4d] px-3 py-1.5 rounded-[2px] w-fit">
      <Link href="/" className="hover:text-[#F5A300] transition-colors flex items-center gap-1">
        <Home className="w-3.5 h-3.5 text-[#F5A300]" />
        <span>HOME</span>
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <ChevronRight className="w-3.5 h-3.5 text-[#BE3D1F]" />
          {item.href ? (
            <Link href={item.href} className="hover:text-[#F5A300] transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-[#132A3A] dark:text-[#E7DCC4] font-bold uppercase">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
