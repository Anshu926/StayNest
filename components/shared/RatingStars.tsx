import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  totalReviews?: number;
  size?: "sm" | "md";
  className?: string;
}

export default function RatingStars({ rating, totalReviews, size = "sm", className }: RatingStarsProps) {
  const stars = Array.from({ length: 5 }, (_, i) => i + 1);

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center">
        {stars.map((star) => (
          <Star
            key={star}
            className={cn(
              size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4",
              star <= Math.round(rating)
                ? "text-amber-400 fill-amber-400 drop-shadow-[0_0_2px_rgba(251,191,36,0.3)]"
                : "text-gray-200 fill-gray-200 dark:text-slate-700 dark:fill-slate-700"
            )}
          />
        ))}
      </div>
      <span className={cn("font-semibold text-gray-800 dark:text-slate-200", size === "sm" ? "text-xs" : "text-sm")}>
        {rating.toFixed(1)}
      </span>
      {totalReviews !== undefined && (
        <span className={cn("text-gray-400 dark:text-slate-500", size === "sm" ? "text-xs" : "text-sm")}>
          ({totalReviews})
        </span>
      )}
    </div>
  );
}
