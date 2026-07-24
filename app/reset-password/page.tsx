"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getSupabase } from "@/src/lib/supabase";
import { SITE_NAME } from "@/src/lib/constants";
import {
  authInputClass,
  authLabelClass,
  authPrimaryBtnClass,
} from "@/src/components/auth/AuthLanding";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [sessionOk, setSessionOk] = useState(false);

  useEffect(() => {
    const supabase = getSupabase();
    let active = true;

    const check = async () => {
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      setSessionOk(!!data.session);
      setReady(true);
    };

    check();

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setSessionOk(!!session);
        setReady(true);
      }
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const supabase = getSupabase();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message || "Could not update password");
        return;
      }
      setSuccess("Password updated. You can sign in with your new password.");
      setTimeout(() => router.push("/login"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update password");
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

        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Set new password</h1>
        <p className="text-[14px] text-[#71767b] mb-8">
          Choose a strong password for your Dhaka Wholesale account.
        </p>

        {!ready ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !sessionOk ? (
          <div className="space-y-4">
            <p className="text-sm text-[#f4212e] bg-[#f4212e]/10 border border-[#f4212e]/30 rounded-xl px-4 py-3">
              This reset link is invalid or has expired. Request a new one.
            </p>
            <Link
              href="/forgot-password"
              className="inline-flex justify-center w-full h-12 items-center rounded-full bg-white text-black font-bold text-[15px]"
            >
              Request new link
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={authLabelClass}>New password</label>
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
              {loading ? "Updating..." : "Update password"}
            </button>
          </form>
        )}

        <p className="text-center text-[14px] text-[#71767b] mt-8">
          <Link href="/login" className="text-white font-semibold hover:underline">
            Back to log in
          </Link>
        </p>
      </div>
    </div>
  );
}
