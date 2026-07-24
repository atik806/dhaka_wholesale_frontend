"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabase } from "@/src/lib/supabase";
import { SITE_NAME } from "@/src/lib/constants";
import {
  AuthBanner,
  AuthShell,
  authLinkClass,
} from "@/src/components/auth/AuthLanding";
import { Button, buttonClasses } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";

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
    <AuthShell
      title="Set new password"
      subtitle={`Choose a strong password for your ${SITE_NAME} account.`}
      footer={
        <Link href="/login" className={authLinkClass}>
          Back to log in
        </Link>
      }
    >
      {!ready ? (
        <div className="flex justify-center py-10">
          <div
            className="w-8 h-8 border-2 border-line-strong border-t-accent rounded-full animate-spin"
            role="status"
            aria-label="Checking your reset link"
          />
        </div>
      ) : !sessionOk ? (
        <div className="space-y-4">
          <AuthBanner tone="error">
            This reset link is invalid or has expired. Request a new one.
          </AuthBanner>
          <Link
            href="/forgot-password"
            className={buttonClasses({ size: "lg", fullWidth: true })}
          >
            Request new link
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="New password"
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

          {error && <AuthBanner tone="error">{error}</AuthBanner>}
          {success && <AuthBanner tone="success">{success}</AuthBanner>}

          <Button
            type="submit"
            size="lg"
            fullWidth
            loading={loading}
            disabled={loading || !!success}
          >
            {loading ? "Updating…" : "Update password"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
