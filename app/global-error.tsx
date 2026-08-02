"use client";

import { AlertTriangle } from "lucide-react";

// Root error boundary — replaces the entire app (including the root layout)
// when an unrecoverable error occurs there, so it must provide its own
// <html>/<body>. Keep it dependency-free: no providers, fonts or theme are
// mounted at this level.
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <div className="flex items-center justify-center min-h-screen bg-canvas p-6">
          <div className="max-w-md w-full text-center">
            <div
              className="mx-auto w-16 h-16 rounded-full border flex items-center justify-center mb-5"
              style={{ backgroundColor: "#fdecec", borderColor: "rgba(227,52,47,0.3)" }}
            >
              <AlertTriangle className="w-7 h-7 text-danger" aria-hidden="true" />
            </div>
            <h1
              className="text-2xl font-bold text-fg mb-3"
              style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
            >
              Something went wrong
            </h1>
            <p className="text-sm text-muted leading-relaxed mb-8">
              A serious error occurred. Try again, or refresh the page.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => reset()}
                className="inline-flex h-11 items-center justify-center rounded-md px-6 text-sm font-semibold bg-accent text-accent-fg hover:bg-accent-hover transition-colors"
              >
                Try again
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                className="inline-flex h-11 items-center justify-center rounded-md px-6 text-sm font-semibold border border-line-strong bg-surface text-fg hover:bg-surface-2 transition-colors"
              >
                Back to home
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
