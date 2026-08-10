import type { Metadata } from "next";
import { Fraunces, Work_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/src/providers/ToastProvider";
import { ThemeProvider } from "@/src/providers/ThemeProvider";
import { RootClient } from "@/src/components/layout/RootClient";
import { ThemeInit } from "@/src/components/layout/ThemeInit";
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from "@/src/lib/constants";

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
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  icons: {
    icon: [
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: SITE_NAME,
    description: "Bangladesh's trusted online store.",
    url: SITE_URL,
    siteName: SITE_NAME,
    images: [{ url: "/logo.png", width: 1024, height: 1024, alt: SITE_NAME }],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: "Bangladesh's trusted online store.",
    images: ["/logo.png"],
  },
};

/** Best-effort origin extraction so preconnects degrade gracefully in dev/CI. */
function getOrigin(raw: string | undefined): string | null {
  if (!raw) return null;
  try {
    return new URL(raw).origin;
  } catch {
    return null;
  }
}

// The browser talks to two cross-origin hosts: the Nest API and Supabase (PKCE auth).
// Preconnect warms both TCP/TLS connections so the first request doesn't stall.
const API_ORIGIN = getOrigin(process.env.NEXT_PUBLIC_API_URL);
const SUPABASE_ORIGIN = getOrigin(process.env.NEXT_PUBLIC_SUPABASE_URL);

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
      <body className="min-h-dvh flex flex-col bg-canvas text-fg font-sans antialiased">
        {API_ORIGIN && <link rel="preconnect" href={API_ORIGIN} crossOrigin="anonymous" />}
        {SUPABASE_ORIGIN && (
          <link rel="preconnect" href={SUPABASE_ORIGIN} crossOrigin="anonymous" />
        )}
        <ThemeInit />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2.5 focus:bg-accent focus:text-accent-fg focus:font-semibold focus:rounded-md focus:text-sm focus:shadow-lg"
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
