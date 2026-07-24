"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/src/components/ui/Button";
import { SITE_NAME } from "@/src/lib/constants";

export type AuthView = "email-login" | "email-register";

interface AuthLandingProps {
  mode: "login" | "register";
  /** Optional override for the card heading */
  headline?: string;
  googleLoading?: boolean;
  onGoogle: () => void;
  children: (view: AuthView, setView: (v: AuthView) => void) => ReactNode;
  /** Optional banner (OAuth errors, etc.) shown above the form */
  banner?: ReactNode;
}

export function GoogleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
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

/**
 * Inline link styling shared by every auth screen. Resting colour is `fg` rather
 * than `brand` because the brand navy collapses into the surface in dark mode.
 */
export const authLinkClass =
  "font-semibold text-fg underline underline-offset-4 decoration-line-strong hover:text-accent-hover hover:decoration-accent transition-colors";

/** Small muted print (terms, helper copy) shared by every auth screen. */
export const authFinePrintClass = "text-[12px] leading-relaxed text-muted";

/** Status message shown above or inside an auth form. */
export function AuthBanner({
  tone = "error",
  children,
}: {
  tone?: "error" | "success" | "info";
  children: ReactNode;
}) {
  if (!children) return null;
  const tones = {
    error: "bg-danger-soft text-danger border-danger/30",
    success: "bg-success-soft text-success border-success/30",
    info: "bg-info-soft text-info border-info/30",
  } as const;
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={`text-[13px] font-medium border rounded-md px-4 py-3 ${tones[tone]}`}
    >
      {children}
    </p>
  );
}

/** Full-width Google OAuth button used on every auth screen. */
export function GoogleButton({
  onClick,
  loading,
  label = "Continue with Google",
}: {
  onClick: () => void;
  loading?: boolean;
  label?: string;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      fullWidth
      onClick={onClick}
      disabled={loading}
    >
      <GoogleIcon className="w-[18px] h-[18px]" />
      {loading ? "Redirecting…" : label}
    </Button>
  );
}

/** Horizontal "or" rule between OAuth and the email form. */
export function AuthDivider({ label = "or" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3" aria-hidden>
      <span className="flex-1 border-t border-line" />
      <span className="label-caps text-subtle">{label}</span>
      <span className="flex-1 border-t border-line" />
    </div>
  );
}

/**
 * Branded, self-contained page frame for auth screens. These routes render
 * without the site header/footer, so the shell carries the logo and wordmark.
 */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-canvas flex flex-col">
      <div className="h-1 bg-accent shrink-0" aria-hidden />
      <div className="flex-1 flex items-center justify-center px-4 py-10 sm:py-14">
        <div className="w-full max-w-[26rem]">
          <div className="flex flex-col items-center text-center mb-6">
            <Link
              href="/"
              aria-label={`${SITE_NAME} — back to home`}
              className="inline-flex rounded-full"
            >
              <span className="relative block w-16 h-16 rounded-full overflow-hidden border border-line bg-surface shadow-sm">
                <Image
                  src="/logo.png"
                  alt=""
                  fill
                  priority
                  className="object-cover"
                  sizes="64px"
                />
              </span>
            </Link>
            <p className="label-caps text-accent-text mt-3">{SITE_NAME}</p>
          </div>

          <div className="bg-surface border border-line rounded-xl shadow-md p-6 sm:p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl sm:text-[1.75rem] font-bold">{title}</h1>
              {subtitle && (
                <p className="text-sm text-muted mt-2 leading-relaxed">{subtitle}</p>
              )}
            </div>
            {children}
          </div>

          {footer && (
            <div className="mt-5 text-center text-sm text-muted">{footer}</div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Centered spinner used by auth Suspense fallbacks. */
export function AuthSpinner({ message }: { message?: string }) {
  return (
    <div className="min-h-dvh bg-canvas flex items-center justify-center px-4">
      <div className="text-center">
        <div
          className="w-8 h-8 border-2 border-line-strong border-t-accent rounded-full animate-spin mx-auto"
          role="status"
          aria-label={message ?? "Loading"}
        />
        {message && <p className="text-sm text-muted mt-4">{message}</p>}
      </div>
    </div>
  );
}

export function AuthLanding({
  mode,
  headline,
  googleLoading,
  onGoogle,
  children,
  banner,
}: AuthLandingProps) {
  const [view, setView] = useState<AuthView>(
    mode === "register" ? "email-register" : "email-login",
  );
  const isRegister = view === "email-register";

  const title =
    headline ?? (isRegister ? "Create your account" : "Welcome back");
  const subtitle = isRegister
    ? "Track your orders and check out faster with cash on delivery."
    : "Sign in to track your orders and check out faster.";

  const footer = isRegister ? (
    <>
      Already have an account?{" "}
      {mode === "register" ? (
        <button
          type="button"
          onClick={() => setView("email-login")}
          className={authLinkClass}
        >
          Log in
        </button>
      ) : (
        <Link href="/login" className={authLinkClass}>
          Log in
        </Link>
      )}
    </>
  ) : (
    <>
      New to {SITE_NAME}?{" "}
      {mode === "login" ? (
        <Link href="/register" className={authLinkClass}>
          Create an account
        </Link>
      ) : (
        <button
          type="button"
          onClick={() => setView("email-register")}
          className={authLinkClass}
        >
          Create an account
        </button>
      )}
    </>
  );

  return (
    <AuthShell title={title} subtitle={subtitle} footer={footer}>
      <div className="space-y-5">
        <GoogleButton
          onClick={onGoogle}
          loading={googleLoading}
          label={isRegister ? "Sign up with Google" : "Continue with Google"}
        />

        <AuthDivider label="or use email" />

        {banner}

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
            {children(view, setView)}
          </motion.div>
        </AnimatePresence>

        <p className={authFinePrintClass}>
          By continuing, you agree to our{" "}
          <Link href="/privacy-policy" className={authLinkClass}>
            Terms
          </Link>
          ,{" "}
          <Link href="/privacy-policy" className={authLinkClass}>
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link href="/faq" className={authLinkClass}>
            Cookie Use
          </Link>
          .
        </p>
      </div>
    </AuthShell>
  );
}
