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

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setError("");
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
        setError(oauthErr.message || "Failed to start Google sign-in");
        setGoogleLoading(false);
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch {
      setError("Failed to start Google sign-in");
      setGoogleLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
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
        setSuccess(
          data.message ||
            "Registration successful! Please check your email to confirm your account.",
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
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

  const banner = (
    <>
      {error && <AuthBanner tone="error">{error}</AuthBanner>}
      {success && <AuthBanner tone="success">{success}</AuthBanner>}
    </>
  );

  return (
    <AuthLanding
      mode="register"
      googleLoading={googleLoading}
      onGoogle={handleGoogleSignIn}
      banner={banner}
    >
      {(view) =>
        view === "email-login" ? (
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
        ) : (
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
            <Button
              type="submit"
              size="lg"
              fullWidth
              loading={loading}
              disabled={loading || !!success}
            >
              {loading ? "Creating account…" : "Create account"}
            </Button>
          </form>
        )
      }
    </AuthLanding>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<AuthSpinner />}>
      <RegisterForm />
    </Suspense>
  );
}
