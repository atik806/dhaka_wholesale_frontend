"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getSupabase } from "@/src/lib/supabase";
import { SITE_NAME } from "@/src/lib/constants";
import {
  authInputClass,
  authLabelClass,
  authPrimaryBtnClass,
} from "@/src/components/auth/AuthLanding";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const supabase = getSupabase();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent("/reset-password")}`,
        },
      );
      if (resetError) {
        setError(resetError.message || "Could not send reset email");
        return;
      }
      setSuccess(
        "If an account exists for that email, a password reset link has been sent. Check your inbox and spam folder.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-black text-white flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-6 py-10 mx-auto w-full max-w-[440px]">
        <Link
          href="/"
          className="mb-8 self-start inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded-full"
          aria-label={SITE_NAME}
        >
          <span className="relative w-14 h-14 rounded-full overflow-hidden border border-[#2f3336] bg-[#0a0a0a]">
            <Image src="/logo.png" alt={SITE_NAME} fill priority className="object-cover" sizes="56px" />
          </span>
        </Link>

        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Forgot password?</h1>
        <p className="text-[14px] text-[#71767b] mb-8">
          Enter your email and we&apos;ll send a link to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          {error && (
            <p className="text-sm font-medium text-[#f4212e] bg-[#f4212e]/10 border border-[#f4212e]/30 rounded-xl px-4 py-3">
              {error}
            </p>
          )}
          {success && (
            <p className="text-sm font-medium text-[#00ba7c] bg-[#00ba7c]/10 border border-[#00ba7c]/30 rounded-xl px-4 py-3">
              {success}
            </p>
          )}

          <button type="submit" className={authPrimaryBtnClass} disabled={loading || !!success}>
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>

        <p className="text-center text-[14px] text-[#71767b] mt-8">
          Remembered it?{" "}
          <Link href="/login" className="text-white font-semibold hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
