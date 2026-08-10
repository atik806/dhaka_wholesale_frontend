"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { CartDrawer } from "./CartDrawer";
import { DepartmentsPanel } from "./DepartmentsPanel";
import { Toaster } from "../ui/Toaster";
import { ScrollToTop } from "../ui/ScrollToTop";
import { PageLoader } from "../ui/PageLoader";
import { ReportButton } from "../report/ReportButton";
import { loadServerCartAndWishlist } from "@/src/lib/cart-sync";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useCartHydrated } from "@/src/store/useCartStore";
import { motion } from "framer-motion";

// Non-blocking fade-in on navigation. AnimatePresence mode="wait" was removed:
// it deferred mounting the next page until the exit animation finished (~200ms),
// which made every link click feel laggy. Without an exit step the new page
// mounts immediately and only fades in, so navigation stays instant.
const pageTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.15, ease: "easeOut" as const },
} as const;

export function RootClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password" ||
    pathname.startsWith("/auth/");
  const initAuth = useAuthStore((s) => s.initAuth);
  const hydrated = useAuthStore((s) => s._hydrated);
  const cartHydrated = useCartHydrated();
  const isLoggedIn = useAuthStore((s) => !!s.user);

  useEffect(() => {
    if (hydrated) void initAuth();
  }, [hydrated, initAuth]);

  useEffect(() => {
    // Authenticated session restore / return visits: load server cart + wishlist.
    // Skip auth pages — login/register/callback own merge-then-load.
    if (!hydrated || !cartHydrated || !isLoggedIn) return;
    if (isAuthPage) return;
    void loadServerCartAndWishlist();
  }, [hydrated, cartHydrated, isLoggedIn, isAuthPage, pathname]);

  return (
    <>
      <PageLoader />
      {!isAdmin && !isAuthPage && <Header />}
      {!isAdmin && !isAuthPage ? (
        <div className="flex-1 flex items-stretch">
          <DepartmentsPanel />
          <main id="main-content" className="flex-1 min-w-0 pb-14 md:pb-0">
            <motion.div {...pageTransition}>
              {children}
            </motion.div>
          </main>
        </div>
      ) : (
        <main id="main-content" className={`flex-1 ${isAuthPage ? "" : "pb-14 md:pb-0"}`}>
          <motion.div {...pageTransition}>
            {children}
          </motion.div>
        </main>
      )}
      {!isAdmin && !isAuthPage && (
        <div className="pb-[env(safe-area-inset-bottom)]">
          <Footer />
        </div>
      )}
      {!isAdmin && !isAuthPage && <CartDrawer />}
      <Toaster />
      {!isAdmin && !isAuthPage && <ScrollToTop />}
      {!isAdmin && !isAuthPage && <ReportButton />}
    </>
  );
}
