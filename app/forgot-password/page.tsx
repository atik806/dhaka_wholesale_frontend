"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getSupabase } from "@/src/lib/supabase";
import {
  oauthCallbackUrl,
  rememberPostAuthRedirect,
} from "@/src/lib/oauth-redirect";
import {
  AuthBanner,
  AuthShell,
  AuthSpinner,
  authLinkClass,
} from "@/src/components/auth/AuthLanding";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";

function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const isAdmin = searchParams.get("admin") === "1";
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
      rememberPostAuthRedirect("/reset-password", true);
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: oauthCallbackUrl(),
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
    <AuthShell
      title={isAdmin ? "Reset admin password" : "Forgot password?"}
      subtitle={
        isAdmin
          ? "Enter the admin email and we'll send a secure reset link."
          : "Enter your email and we'll send a link to reset your password."
      }
      footer={
        <>
          Remembered it?{" "}
          <Link href={isAdmin ? "/admin/login" : "/login"} className={authLinkClass}>
            {isAdmin ? "Admin login" : "Log in"}
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          required
          autoComplete="email"
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
          {loading ? "Sending…" : "Send reset link"}
        </Button>
      </form>
    </AuthShell>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<AuthSpinner message="Loading password recovery…" />}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
