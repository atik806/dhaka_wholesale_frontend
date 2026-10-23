"use client";

import { usePathname } from "next/navigation";
import { MESSENGER_URL } from "@/src/lib/constants";
import { cn } from "@/src/lib/utils";

/** Messenger's lightning-bolt chat mark. */
function MessengerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.19 5.44 3.14 7.17.16.15.26.35.27.57l.05 1.78c.02.57.6.94 1.12.71l1.98-.87c.17-.08.36-.09.53-.05.91.25 1.88.39 2.91.39 5.64 0 10-4.13 10-9.7S17.64 2 12 2Zm6 7.46-2.94 4.66a1.5 1.5 0 0 1-2.17.4l-2.34-1.75a.6.6 0 0 0-.72 0l-3.16 2.4c-.42.32-.97-.18-.69-.63l2.94-4.66a1.5 1.5 0 0 1 2.17-.4l2.34 1.75a.6.6 0 0 0 .72 0l3.16-2.4c.42-.32.97.18.69.63Z" />
    </svg>
  );
}

/**
 * Floating "Chat 24/7" button that opens the shop's Messenger.
 *
 * Phones: a round button above the bottom nav. Product pages lift it above
 * the sticky buy bar; cart and checkout hide it until desktop width, since
 * their sticky checkout bar fills that space. Tablet and desktop: a labelled
 * pill in the corner, below the scroll-to-top button.
 */
export function MessengerButton() {
  const pathname = usePathname();
  const onProduct = pathname.startsWith("/product/");
  // Cart and checkout show a sticky checkout bar below the lg breakpoint.
  const hideBelowDesktop = pathname === "/cart" || pathname === "/checkout";

  return (
    <a
      href={MESSENGER_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on Messenger, 24/7"
      className={cn(
        "group fixed right-4 z-30 items-center gap-2 rounded-full bg-[#0866ff] text-white shadow-lg shadow-black/20 ring-1 ring-white/15 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0756d6] hover:shadow-xl active:scale-95",
        "h-12 w-12 justify-center md:bottom-6 md:right-6 md:h-12 md:w-auto md:px-4",
        hideBelowDesktop ? "hidden lg:flex" : "flex",
        onProduct
          ? "bottom-[calc(8.75rem+env(safe-area-inset-bottom))]"
          : "bottom-[calc(4.25rem+env(safe-area-inset-bottom))]",
      )}
    >
      <MessengerIcon className="h-6 w-6 shrink-0" />
      <span className="hidden text-sm font-semibold md:inline">Chat 24/7</span>
      {/* Phones show only the icon; a small badge keeps the 24/7 promise visible. */}
      <span
        aria-hidden="true"
        className="absolute -top-1.5 -left-1.5 rounded-full bg-accent px-1.5 py-0.5 text-[9px] font-bold leading-none text-accent-fg ring-2 ring-canvas md:hidden"
      >
        24/7
      </span>
    </a>
  );
}
