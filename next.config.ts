import type { NextConfig } from "next";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://placeholder.vercel.app/api";

let apiOrigin: string;
try {
  apiOrigin = new URL(apiUrl).origin;
} catch {
  apiOrigin = apiUrl.startsWith("http") ? apiUrl : `https://${apiUrl}`;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let supabaseOrigin = "";
if (supabaseUrl) {
  try {
    supabaseOrigin = new URL(supabaseUrl).origin;
  } catch {
    supabaseOrigin = supabaseUrl.startsWith("http") ? supabaseUrl : `https://${supabaseUrl}`;
  }
}
const isDev = process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "images.unsplash.com" },
      ...(supabaseOrigin
        ? [{ protocol: "https" as const, hostname: new URL(supabaseOrigin).hostname }]
        : []),
    ],
  },
  // Proxy the browser's same-origin `/api/*` requests to the real backend.
  // The frontend (dhakawholesale.com) and backend (*.vercel.app) are different
  // sites, so a cookie the backend sets cross-site is dropped by Safari and by
  // Chrome's third-party-cookie controls — which silently breaks admin and
  // customer login. Routing every browser API call through this same-origin
  // path makes the `dw_session` cookie first-party. Server-side code still
  // calls the backend directly (see src/lib/constants.ts).
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl.replace(/\/+$/, "")}/:path*`,
      },
    ];
  },
  // Keep recently-viewed dynamic pages (product/category) in the client router
  // cache briefly so back-navigation renders instantly instead of re-fetching.
  experimental: {
    staleTimes: {
      dynamic: 30,
      static: 300,
    },
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            // C4: `script-src 'unsafe-inline'` is kept intentionally. The App
            // Router inlines bootstrapping scripts during streaming/hydration,
            // so a strict nonce policy would need middleware-injected nonces
            // plus a next/script transform to be reliable — deferred. The
            // residual inline-script surface is mitigated by React's
            // auto-escaping and by the URL-scheme guards (isSafeHttpUrl /
            // safePromoLink) applied to every DB-backed URL the app renders.
            // `'unsafe-eval'` is dev-only (added when NODE_ENV !== production).
            value:
              `default-src 'self'; script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' ${apiOrigin}${supabaseOrigin ? ` ${supabaseOrigin}` : ""}; frame-ancestors 'none';`,
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
