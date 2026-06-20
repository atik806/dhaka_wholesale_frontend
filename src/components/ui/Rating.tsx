import { Star } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface RatingProps {
  value: number;
  count?: number;
  size?: "sm" | "md";
}

export function Rating({ value, count, size = "sm" }: RatingProps) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4",
              star <= Math.round(value)
                ? "fill-amber-400 dark:fill-amber-300 text-amber-400 dark:text-amber-300"
                : "fill-zinc-200 dark:fill-zinc-600 text-zinc-200 dark:text-zinc-600"
            )}
          />
        ))}
      </div>
      {count !== undefined && (
        <span className="text-xs text-zinc-500 dark:text-zinc-400">({count.toLocaleString()})</span>
      )}
    </div>
  );
}
