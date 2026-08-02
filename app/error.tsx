"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/src/components/ui/Button";

// Route-segment error boundary (rendered inside the root layout, so design
// tokens and fonts are available). Does not leak error details to users.
export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex items-center justify-center bg-canvas min-h-[70vh]">
      <div className="container max-w-xl py-16 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-danger-soft border border-danger/30 flex items-center justify-center mb-5">
          <AlertTriangle className="w-7 h-7 text-danger" aria-hidden="true" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif text-fg mb-3">
          Something went wrong
        </h1>
        <p className="text-muted text-sm leading-relaxed max-w-md mx-auto mb-8">
          An unexpected error happened while loading this page. Try again, or
          head back to the store.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" onClick={() => reset()}>
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            Try again
          </Button>
          <Button variant="outline" size="lg" onClick={() => (window.location.href = "/")}>
            Back to home
          </Button>
        </div>
      </div>
    </main>
  );
}
