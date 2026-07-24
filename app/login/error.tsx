"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button, buttonClasses } from "@/src/components/ui/Button";

export default function LoginError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Login page error:", error);
  }, [error]);

  return (
    <div className="min-h-dvh bg-canvas flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm bg-surface border border-line rounded-xl shadow-md p-6 sm:p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-danger-soft text-danger flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
        <p className="text-sm text-muted leading-relaxed mb-6">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} className="sm:flex-1">
            Try again
          </Button>
          <Link
            href="/"
            className={buttonClasses({ variant: "outline", className: "sm:flex-1" })}
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
