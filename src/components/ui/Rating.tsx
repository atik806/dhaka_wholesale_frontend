import { Star } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface RatingProps {
  value: number;
  count?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "w-3.5 h-3.5",
  md: "w-4 h-4",
  lg: "w-5 h-5",
};

export function Rating({ value, count, size = "sm", className }: RatingProps) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex" role="img" aria-label={`Rated ${value} out of 5`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              sizes[size],
              star <= Math.round(value)
                ? "fill-accent text-accent"
                : "fill-surface-3 text-surface-3",
            )}
          />
        ))}
      </div>
      {count !== undefined && (
        <span className="text-xs text-muted tabular">({count.toLocaleString()})</span>
      )}
    </div>
  );
}
