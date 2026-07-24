"use client";

import { useState } from "react";
import Link from "next/link";
import { getSupabase } from "@/src/lib/supabase";
import {
  AuthBanner,
  AuthShell,
  authLinkClass,
} from "@/src/components/auth/AuthLanding";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";

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
    <AuthShell
      title="Forgot password?"
      subtitle="Enter your email and we'll send a link to reset your password."
      footer={
        <>
          Remembered it?{" "}
          <Link href="/login" className={authLinkClass}>
            Log in
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
