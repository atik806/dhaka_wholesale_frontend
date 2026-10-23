import type { Review } from "@/src/lib/api";

/**
 * Sample (fictional) reviews come from the backend's seed-demo-reviews script.
 * Their profile carries this avatar marker and their text this prefix, which
 * keeps the disclosure in the data itself. The storefront shows a "Sample
 * review" badge instead of the raw prefix.
 */
const SAMPLE_AVATAR_PREFIX = "demo-review://";
const SAMPLE_TEXT_PREFIX = "Sample review (fictional):";

export function isSampleReview(review: Pick<Review, "text" | "profiles">): boolean {
  return (
    Boolean(review.profiles?.avatar_url?.startsWith(SAMPLE_AVATAR_PREFIX)) ||
    Boolean(review.text?.startsWith(SAMPLE_TEXT_PREFIX))
  );
}

export function reviewBody(text: string | null | undefined): string {
  const body = text ?? "";
  return body.startsWith(SAMPLE_TEXT_PREFIX)
    ? body.slice(SAMPLE_TEXT_PREFIX.length).trim()
    : body;
}
