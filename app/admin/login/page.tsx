"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE } from "@/src/lib/constants";
import { SiteLogo } from "@/src/components/brand/SiteLogo";
import { AuthDivider, GoogleButton } from "@/src/components/auth/AuthLanding";
import { getSupabase } from "@/src/lib/supabase";
import { oauthCallbackUrl, rememberPostAuthRedirect } from "@/src/lib/oauth-redirect";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Admins who signed up with Google have no password to type here. After
  // Google sign-in the callback returns to /admin, whose layout checks the
  // admin role against the backend before showing anything.
  const handleGoogle = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      const raw = new URLSearchParams(window.location.search).get("redirect") || "/admin";
      rememberPostAuthRedirect(raw.startsWith("/admin") ? raw : "/admin");
      const { data, error: oauthErr } = await getSupabase().auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: oauthCallbackUrl(), skipBrowserRedirect: true },
      });
      if (oauthErr || !data?.url) {
        setError(oauthErr?.message || "Failed to start Google sign-in");
        setGoogleLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Failed to start Google sign-in");
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/admin-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        const msg = json?.message || `Login failed (${res.status})`;
        setError(msg);
        return;
      }
      // The session arrives via the httpOnly dw_session cookie (M1) — the body
      // carries only the user. The role check still gates the admin panel.
      if (!json?.data?.user?.id) {
        setError("You do not have admin access");
        return;
      }
      const raw = new URLSearchParams(window.location.search).get("redirect") || "/admin";
      const redirect = raw.startsWith("/admin") ? raw : "/admin";
      router.push(redirect);
    } catch (err) {
      setError(err instanceof Error ? `Connection failed: ${err.message}` : "Cannot reach server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="bg-surface rounded-2xl border border-line shadow-xl p-8 premium-shadow">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-5">
              <SiteLogo variant="auth" href="/" priority showWordmark />
            </div>
            <h1 className="font-serif text-2xl font-bold">Admin Login</h1>
            <p className="text-sm text-muted mt-1">Sign in to manage the store</p>
          </div>
          <div className="space-y-4 mb-4">
            <GoogleButton onClick={handleGoogle} loading={googleLoading} />
            <AuthDivider label="or use email" />
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-fg mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                className="w-full rounded-lg border border-line-strong px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent bg-surface text-fg placeholder:text-muted transition-colors"
              />
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <label className="block text-sm font-semibold text-fg" htmlFor="admin-password">
                  Password
                </label>
                <Link
                  href="/forgot-password?admin=1"
                  className="text-xs font-semibold text-link hover:text-link-hover"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full rounded-lg border border-line-strong px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent bg-surface text-fg placeholder:text-muted transition-colors"
              />
            </div>
            {error && (
              <p className="text-sm text-danger bg-danger-soft border border-danger/30 rounded-lg px-4 py-2.5">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent text-accent-fg rounded-lg py-2.5 text-sm font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
