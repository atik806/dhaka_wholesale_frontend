import { Star } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface RatingProps {
  value: number;
  count?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: { star: "h-3.5 w-3.5", text: "text-xs" },
  md: { star: "h-4 w-4", text: "text-sm" },
  lg: { star: "h-5 w-5", text: "text-base" },
};

/** Review counts past this show as "100+". */
const COUNT_CAP = 100;

/**
 * Compact marketplace-style rating: one star, the average and the review
 * count, e.g. "★ 4.7 (20)". Renders nothing for products without reviews.
 */
export function Rating({ value, count, size = "sm", className }: RatingProps) {
  if (!value || count === 0) return null;
  const s = sizes[size];
  return (
    <div
      className={cn("flex items-center gap-1", s.text, className)}
      aria-label={`Rated ${value.toFixed(1)} out of 5${count ? ` from ${count} reviews` : ""}`}
    >
      <Star className={cn(s.star, "shrink-0 fill-accent text-accent-hover")} strokeWidth={1.75} aria-hidden="true" />
      <span className="tabular font-semibold text-fg">{value.toFixed(1)}</span>
      {count !== undefined && (
        <span className="tabular text-muted">({count >= COUNT_CAP ? `${COUNT_CAP}+` : count})</span>
      )}
    </div>
  );
}
