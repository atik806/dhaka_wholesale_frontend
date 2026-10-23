"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";

interface CartNavButtonProps {
  totalItems: number;
  hydrated?: boolean;
  className?: string;
}

/**
 * Header cart control: a cart icon with an accent count badge, and on wider
 * screens a two-line label matching the "Hello, sign in / Account" items.
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
      className={`group flex min-h-[48px] items-center gap-2.5 rounded-md px-1 py-1.5 sm:px-2 text-brand-fg transition-colors hover:bg-white/10 focus-visible:ring-offset-0 ${className}`}
      aria-label={`Cart, ${count} ${count === 1 ? "item" : "items"}`}
    >
      <span className="relative flex h-10 w-10 items-center justify-center">
        <ShoppingCart
          className="h-[26px] w-[26px] transition-transform duration-200 group-hover:-translate-y-px"
          strokeWidth={1.8}
          aria-hidden
        />
        {count > 0 && (
          <span
            key={label}
            className="tabular pointer-events-none absolute -right-0.5 top-0 flex h-[19px] min-w-[19px] animate-[cart-pop_0.3s_ease-out] items-center justify-center rounded-full bg-accent px-1 text-[11px] font-bold leading-none text-accent-fg ring-2 ring-brand-deep select-none"
            aria-hidden
          >
            {label}
          </span>
        )}
      </span>
      <span className="hidden flex-col justify-center sm:flex">
        <span className="text-[11px] leading-none text-white/60">Your</span>
        <span className="text-[13px] font-semibold leading-tight">Cart</span>
      </span>
    </Link>
  );
}
