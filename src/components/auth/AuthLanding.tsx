"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ChevronRight, ArrowLeft } from "lucide-react";
import { SITE_NAME } from "@/src/lib/constants";

export type AuthView = "landing" | "email-login" | "email-register";

interface AuthLandingProps {
  mode: "login" | "register";
  headline?: string;
  googleLoading?: boolean;
  onGoogle: () => void;
  children: (view: AuthView, setView: (v: AuthView) => void) => ReactNode;
  /** Optional banner (OAuth errors, etc.) shown on all views */
  banner?: ReactNode;
}

function GoogleIcon({ className = "w-5 h-5" }: { className?: string }) {
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

const circleBtn =
  "w-14 h-14 rounded-full border border-[#2f3336] bg-black flex items-center justify-center hover:bg-[#16181c] transition-colors disabled:opacity-50";

export function AuthLanding({
  mode,
  headline,
  googleLoading,
  onGoogle,
  children,
  banner,
}: AuthLandingProps) {
  const defaultHeadline =
    mode === "register" ? "Shop what's\ntrending" : "Welcome\nback";
  const [view, setView] = useState<AuthView>("landing");

  const openEmail = () =>
    setView(mode === "register" ? "email-register" : "email-login");

  return (
    <div className="min-h-dvh bg-black text-white flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-6 py-10 mx-auto w-full max-w-[440px]">
        <AnimatePresence mode="wait">
          {view === "landing" ? (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
              className="flex flex-col"
            >
              <Link
                href="/"
                className="mb-10 self-start inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded-full"
                aria-label={SITE_NAME}
              >
                <span className="relative w-[72px] h-[72px] rounded-full overflow-hidden border border-[#2f3336] bg-[#0a0a0a]">
                  <Image
                    src="/logo.png"
                    alt={SITE_NAME}
                    fill
                    priority
                    className="object-cover"
                    sizes="72px"
                  />
                </span>
              </Link>

              <h1 className="text-[2.35rem] sm:text-[2.75rem] font-extrabold leading-[1.05] tracking-tight whitespace-pre-line mb-10">
                {headline ?? defaultHeadline}
              </h1>

              {banner}

              <div className="flex items-center gap-4 mb-7">
                <button
                  type="button"
                  onClick={onGoogle}
                  disabled={googleLoading}
                  className={circleBtn}
                  aria-label="Continue with Google"
                >
                  <GoogleIcon />
                </button>
                <button
                  type="button"
                  onClick={openEmail}
                  className={circleBtn}
                  aria-label="Continue with Email"
                >
                  <Mail className="w-5 h-5 text-white" strokeWidth={1.75} />
                </button>
              </div>

              <div className="relative flex items-center mb-7">
                <div className="flex-1 border-t border-[#2f3336]" />
                <span className="px-4 text-[15px] text-[#71767b]">or</span>
                <div className="flex-1 border-t border-[#2f3336]" />
              </div>

              <button
                type="button"
                onClick={openEmail}
                className="w-full h-14 rounded-full bg-white text-black font-bold text-[15px] hover:bg-[#e7e9ea] transition-colors disabled:opacity-50"
              >
                Continue with Email
              </button>

              <p className="mt-4 text-[11px] leading-relaxed text-[#71767b]">
                By continuing, you agree to our{" "}
                <Link href="/privacy-policy" className="text-white font-semibold hover:underline">
                  Terms
                </Link>
                ,{" "}
                <Link href="/privacy-policy" className="text-white font-semibold hover:underline">
                  Privacy Policy
                </Link>
                {" "}and{" "}
                <Link href="/faq" className="text-white font-semibold hover:underline">
                  Cookie Use
                </Link>
                .
              </p>

              <div className="mt-12">
                {mode === "register" ? (
                  <button
                    type="button"
                    onClick={() => setView("email-login")}
                    className="inline-flex items-center gap-1.5 text-[15px] text-[#71767b] hover:text-white transition-colors"
                  >
                    Already have an account?{" "}
                    <span className="text-white font-semibold">Log in</span>
                    <ChevronRight className="w-4 h-4 text-[#71767b]" />
                  </button>
                ) : (
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-1.5 text-[15px] text-[#71767b] hover:text-white transition-colors"
                  >
                    Don&apos;t have an account?{" "}
                    <span className="text-white font-semibold">Sign up</span>
                    <ChevronRight className="w-4 h-4 text-[#71767b]" />
                  </Link>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
            >
              <button
                type="button"
                onClick={() => setView("landing")}
                className="mb-8 inline-flex items-center gap-2 text-sm text-[#71767b] hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              <Link
                href="/"
                className="mb-6 inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded-full"
                aria-label={SITE_NAME}
              >
                <span className="relative w-12 h-12 rounded-full overflow-hidden border border-[#2f3336] bg-[#0a0a0a]">
                  <Image
                    src="/logo.png"
                    alt={SITE_NAME}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </span>
              </Link>

              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-6">
                {view === "email-register" ? "Create your account" : "Log in"}
              </h2>

              {banner}
              {children(view, setView)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export const authInputClass =
  "w-full rounded-xl border border-[#2f3336] bg-black px-4 py-3.5 text-[15px] text-white outline-none placeholder:text-[#71767b] focus:border-[#1d9bf0] focus:ring-1 focus:ring-[#1d9bf0]";

export const authLabelClass =
  "block text-[13px] font-semibold text-[#e7e9ea] mb-1.5";

export const authPrimaryBtnClass =
  "w-full h-12 rounded-full bg-white text-black font-bold text-[15px] hover:bg-[#e7e9ea] transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

export const authSecondaryBtnClass =
  "w-full h-12 rounded-full border border-[#536471] bg-transparent text-white font-bold text-[15px] hover:bg-[#16181c] transition-colors disabled:opacity-50 flex items-center justify-center gap-3";
