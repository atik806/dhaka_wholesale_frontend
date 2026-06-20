import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Header } from "@/src/components/layout/Header";
import { Footer } from "@/src/components/layout/Footer";
import { CartDrawer } from "@/src/components/layout/CartDrawer";
import { Toaster } from "@/src/components/ui/Toaster";
import { ToastProvider } from "@/src/providers/ToastProvider";
import { ThemeProvider } from "@/src/providers/ThemeProvider";
import { ScrollToTop } from "@/src/components/ui/ScrollToTop";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CholoKini — Premium Curated Store",
  description: "Discover premium products curated for your lifestyle",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}else if(t==='light'){document.documentElement.classList.remove('dark')}}catch(e){}})();`}
        </Script>
      </head>
      <body className="min-h-dvh flex flex-col bg-white dark:bg-zinc-900 antialiased">
        <ThemeProvider>
        <ToastProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
          <Toaster />
          <ScrollToTop />
        </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
