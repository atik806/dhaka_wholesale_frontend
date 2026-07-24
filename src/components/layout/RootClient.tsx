"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { CartDrawer } from "./CartDrawer";
import { Toaster } from "../ui/Toaster";
import { ScrollToTop } from "../ui/ScrollToTop";
import { PageLoader } from "../ui/PageLoader";
import { ReportButton } from "../report/ReportButton";
import { loadServerCartAndWishlist } from "@/src/lib/cart-sync";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useCartHydrated } from "@/src/store/useCartStore";

export function RootClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isAuthPage = pathname === "/login" || pathname === "/register";
  const initAuth = useAuthStore((s) => s.initAuth);
  const hydrated = useAuthStore((s) => s._hydrated);
  const cartHydrated = useCartHydrated();
  const isLoggedIn = useAuthStore((s) => !!s.user && !!s.session);

  useEffect(() => {
    if (hydrated) void initAuth();
  }, [hydrated, initAuth]);

  useEffect(() => {
    // Authenticated session restore / return visits: load server cart + wishlist.
    // Skip auth pages — login/register/callback own merge-then-load.
    if (!hydrated || !cartHydrated || !isLoggedIn) return;
    if (isAuthPage || pathname.startsWith("/auth/callback")) return;
    void loadServerCartAndWishlist();
  }, [hydrated, cartHydrated, isLoggedIn, isAuthPage, pathname]);

  return (
    <>
      <PageLoader />
      {!isAdmin && <Header />}
      <main id="main-content" className="flex-1 pb-14 md:pb-0">{children}</main>
      {!isAdmin && !isAuthPage && <div className="pb-[env(safe-area-inset-bottom)]"><Footer /></div>}
      {!isAdmin && <CartDrawer />}
      <Toaster />
      {!isAdmin && <ScrollToTop />}
      {!isAdmin && <ReportButton />}
    </>
  );
}
