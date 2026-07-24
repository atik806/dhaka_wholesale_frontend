"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";

interface CartNavButtonProps {
  totalItems: number;
  hydrated?: boolean;
  className?: string;
}

/**
 * Amazon-style cart control: count sits in the basket area of the icon.
 */
export function CartNavButton({
  totalItems,
  hydrated = true,
  className = "",
}: CartNavButtonProps) {
  const count = hydrated ? totalItems : 0;
  const label = count > 99 ? "99+" : String(count);

  return (
    <Link
      href="/cart"
      className={`group relative flex items-end gap-1 px-1.5 sm:px-2 py-1 rounded-sm text-brand-fg hover:outline hover:outline-1 hover:outline-brand-fg/40 min-h-[48px] ${className}`}
      aria-label={`Cart, ${count} items`}
    >
      <span className="relative inline-block w-10 h-9 sm:w-11 sm:h-10">
        <ShoppingCart
          className="absolute inset-0 w-full h-full"
          strokeWidth={1.6}
          aria-hidden
        />
        {/* Count nestled in cart basket (Amazon pattern) */}
        <span
          className="pointer-events-none absolute left-1/2 top-[2px] -translate-x-1/2 min-w-[1.1rem] text-center text-[13px] sm:text-[14px] font-bold leading-none text-accent tabular select-none"
          style={{ textShadow: "0 0 3px var(--brand), 0 0 3px var(--brand)" }}
        >
          {label}
        </span>
      </span>
      <span className="hidden sm:inline text-[13px] font-bold pb-0.5">
        Cart
      </span>
    </Link>
  );
}
