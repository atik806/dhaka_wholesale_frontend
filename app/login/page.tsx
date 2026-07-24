"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { loginUser, registerUser } from "@/src/lib/auth-api";
import {
  mergeGuestCartOnLogin,
  snapshotGuestCart,
} from "@/src/lib/cart-sync";
import { getSupabase } from "@/src/lib/supabase";
import { useAuthStore } from "@/src/store/useAuthStore";
import {
  AuthBanner,
  AuthLanding,
  AuthSpinner,
  authLinkClass,
} from "@/src/components/auth/AuthLanding";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";

function safeRedirect(path: string | null): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return "/";
  return path;
}

function getOAuthError(
  errorType: string | null,
  desc: string | null,
): string {
  if (errorType === "oauth_profile_failed") {
    return "Could not create your account. Please try again.";
  }
  if (errorType === "oauth_exchange_failed") {
    return "Google sign-in timed out. Please try again.";
  }
  if (errorType === "oauth_failed") {
    const msg = desc ? decodeURIComponent(desc) : "";
    if (msg.includes("No session found") || msg.includes("no_session")) {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      return `Google sign-in failed. Please ensure the Supabase redirect URL includes ${origin}/auth/callback.`;
    }
    return "Google sign-in failed. Please try again.";
  }
  return "";
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [oauthError, setOauthError] = useState(() =>
    getOAuthError(searchParams.get("error"), searchParams.get("error_description")),
  );

  const handleGoogleSignIn = async () => {
    setOauthError("");
    setGoogleLoading(true);
    try {
      const redirect = safeRedirect(searchParams.get("redirect"));
      const supabase = getSupabase();
      const { data, error: oauthErr } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
          skipBrowserRedirect: true,
        },
      });

      if (oauthErr) {
        setOauthError(oauthErr.message || "Failed to start Google sign-in");
        setGoogleLoading(false);
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch {
      setOauthError("Failed to start Google sign-in");
      setGoogleLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await loginUser(email, password);
      if (!data.session?.access_token) {
        setError(data.message || "Login failed");
        return;
      }
      const guest = snapshotGuestCart();
      setAuth(data.user, data.session);
      await mergeGuestCartOnLogin(guest);
      router.push(safeRedirect(searchParams.get("redirect")));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const data = await registerUser(name, email, password);
      if (data.session?.access_token) {
        const guest = snapshotGuestCart();
        setAuth(data.user, data.session);
        await mergeGuestCartOnLogin(guest);
        router.push(safeRedirect(searchParams.get("redirect")));
      } else {
        setError(data.message || "Check your email to confirm your account.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const banner =
    oauthError || error ? (
      <AuthBanner tone="error">{oauthError || error}</AuthBanner>
    ) : null;

  return (
    <AuthLanding
      mode="login"
      googleLoading={googleLoading}
      onGoogle={handleGoogleSignIn}
      banner={banner}
    >
      {(view) =>
        view === "email-register" ? (
          <form onSubmit={handleRegister} className="space-y-4">
            <Input
              label="Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              minLength={2}
              autoComplete="name"
            />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 characters"
              required
              minLength={8}
              autoComplete="new-password"
            />
            <Input
              label="Confirm password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat password"
              required
              minLength={8}
              autoComplete="new-password"
            />
            <Button type="submit" size="lg" fullWidth loading={loading} disabled={loading}>
              {loading ? "Creating account…" : "Create account"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              required
              autoComplete="email"
            />
            <div>
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
              <div className="flex justify-end mt-2">
                <Link href="/forgot-password" className={`text-[13px] ${authLinkClass}`}>
                  Forgot password?
                </Link>
              </div>
            </div>
            <Button type="submit" size="lg" fullWidth loading={loading} disabled={loading}>
              {loading ? "Signing in…" : "Log in"}
            </Button>
          </form>
        )
      }
    </AuthLanding>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthSpinner />}>
      <LoginForm />
    </Suspense>
  );
}
