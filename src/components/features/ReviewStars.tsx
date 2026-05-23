import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewStarsProps {
  rating: number;
  count?: number;
  size?: number;
  showCount?: boolean;
  className?: string;
}

export function ReviewStars({
  rating,
  count,
  size = 16,
  showCount = true,
  className,
}: ReviewStarsProps) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= Math.floor(rating);
          const half = star === Math.ceil(rating) && rating % 1 >= 0.5;

          return (
            <Star
              key={star}
              size={size}
              className={cn(
                "transition-colors",
                filled || half
                  ? "text-[var(--color-accent)] fill-[var(--color-accent)]"
                  : "text-[var(--color-border)] fill-none"
              )}
            />
          );
        })}
      </div>
      {showCount && count !== undefined && (
        <span className="text-sm text-[var(--color-text-muted)]">
          ({count})
        </span>
      )}
    </div>
  );
}
