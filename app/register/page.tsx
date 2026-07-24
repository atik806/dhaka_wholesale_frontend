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
  AuthLanding,
  authInputClass,
  authLabelClass,
  authPrimaryBtnClass,
  authSecondaryBtnClass,
} from "@/src/components/auth/AuthLanding";

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
      {error && (
        <p className="mb-4 text-sm font-medium text-[#f4212e] bg-[#f4212e]/10 border border-[#f4212e]/30 rounded-xl px-4 py-3">
          {error}
        </p>
      )}
      {success && (
        <p className="mb-4 text-sm font-medium text-[#00ba7c] bg-[#00ba7c]/10 border border-[#00ba7c]/30 rounded-xl px-4 py-3">
          {success}
        </p>
      )}
    </>
  );

  return (
    <AuthLanding
      mode="register"
      headline={"Shop what's\ntrending"}
      googleLoading={googleLoading}
      onGoogle={handleGoogleSignIn}
      banner={banner}
    >
      {(view) =>
        view === "email-login" ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className={authLabelClass}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                required
                autoComplete="email"
                className={authInputClass}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[13px] font-semibold text-[#e7e9ea]">Password</label>
                <Link
                  href="/forgot-password"
                  className="text-[13px] text-[#1d9bf0] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className={authInputClass}
              />
            </div>
            <button type="submit" className={authPrimaryBtnClass} disabled={loading}>
              {loading ? "Signing in..." : "Log in"}
            </button>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className={authSecondaryBtnClass}
            >
              <GoogleGlyph />
              {googleLoading ? "Redirecting..." : "Continue with Google"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className={authLabelClass}>Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                minLength={2}
                className={authInputClass}
              />
            </div>
            <div>
              <label className={authLabelClass}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                required
                autoComplete="email"
                className={authInputClass}
              />
            </div>
            <div>
              <label className={authLabelClass}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 characters"
                required
                minLength={8}
                autoComplete="new-password"
                className={authInputClass}
              />
            </div>
            <div>
              <label className={authLabelClass}>Confirm password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                required
                minLength={8}
                autoComplete="new-password"
                className={authInputClass}
              />
            </div>
            <p className="text-[11px] leading-relaxed text-[#71767b]">
              By signing up, you agree to our{" "}
              <Link href="/privacy-policy" className="text-white font-semibold hover:underline">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy-policy" className="text-white font-semibold hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
            <button type="submit" className={authPrimaryBtnClass} disabled={loading || !!success}>
              {loading ? "Creating account..." : "Create account"}
            </button>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className={authSecondaryBtnClass}
            >
              <GoogleGlyph />
              {googleLoading ? "Redirecting..." : "Sign up with Google"}
            </button>
            <p className="text-center text-[14px] text-[#71767b] pt-2">
              Already have an account?{" "}
              <Link href="/login" className="text-white font-semibold hover:underline">
                Log in
              </Link>
            </p>
          </form>
        )
      }
    </AuthLanding>
  );
}

function GoogleGlyph() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh bg-black flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
