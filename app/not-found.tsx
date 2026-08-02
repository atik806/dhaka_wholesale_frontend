import Link from "next/link";
import { FileQuestion } from "lucide-react";

// 404 handler — rendered for any route that has no matching page.
// Server component: a 404 needs no client JS.
export default function NotFound() {
  return (
    <main className="flex items-center justify-center bg-canvas min-h-[70vh]">
      <div className="container max-w-xl py-16 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-surface-2 border border-line flex items-center justify-center mb-5">
          <FileQuestion className="w-7 h-7 text-subtle" aria-hidden="true" />
        </div>
        <p className="label-caps text-accent mb-2">404</p>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif text-fg mb-3">
          Page not found
        </h1>
        <p className="text-muted text-sm leading-relaxed max-w-md mx-auto mb-8">
          The page you&rsquo;re looking for doesn&rsquo;t exist or may have been
          moved.
        </p>
        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center rounded-md px-6 text-sm font-semibold bg-accent text-accent-fg hover:bg-accent-hover transition-colors"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
