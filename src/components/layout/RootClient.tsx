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
import { useAuthStore } from "@/src/store/useAuthStore";

export function RootClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const initAuth = useAuthStore((s) => s.initAuth);
  const hydrated = useAuthStore((s) => s._hydrated);

  useEffect(() => {
    if (hydrated) initAuth();
  }, [hydrated, initAuth]);
  return (
    <>
      <PageLoader />
      {!isAdmin && <Header />}
      <main id="main-content" className="flex-1">{children}</main>
      {!isAdmin && <Footer />}
      {!isAdmin && <CartDrawer />}
      <Toaster />
      {!isAdmin && <ScrollToTop />}
      {!isAdmin && <ReportButton />}
    </>
  );
}
