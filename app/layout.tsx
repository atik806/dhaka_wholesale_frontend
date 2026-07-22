import type { Metadata } from "next";
import { Fraunces, Work_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/src/providers/ToastProvider";
import { ThemeProvider } from "@/src/providers/ThemeProvider";
import { RootClient } from "@/src/components/layout/RootClient";
import { ThemeInit } from "@/src/components/layout/ThemeInit";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Dhaka Wholesale",
    template: "%s | Dhaka Wholesale",
  },
  description: "Bangladesh's trusted online store. Quality products, cash on delivery, fast shipping & nationwide delivery.",
  metadataBase: new URL("https://dhakawholesale.com"),
  icons: {
    icon: [
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "Dhaka Wholesale",
    description: "Bangladesh's trusted online store.",
    url: "https://dhakawholesale.com",
    siteName: "Dhaka Wholesale",
    images: [{ url: "/logo.png", width: 1024, height: 1024, alt: "Dhaka Wholesale" }],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dhaka Wholesale",
    description: "Bangladesh's trusted online store.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${workSans.variable} ${ibmPlexMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh flex flex-col bg-[#FBF6EC] dark:bg-[#0D1F2C] text-[#1C1A17] dark:text-[#E7DCC4] font-sans antialiased selection:bg-[#F5A300]/30 selection:text-[#132A3A]">
        <ThemeInit />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[#F5A300] focus:text-[#132A3A] focus:font-bold focus:rounded-[3px] focus:text-sm shadow-lg border border-[#132A3A]"
        >
          Skip to main content
        </a>
        <ThemeProvider>
          <ToastProvider>
            <RootClient>{children}</RootClient>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
