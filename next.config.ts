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
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
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
