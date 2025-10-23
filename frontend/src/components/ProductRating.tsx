import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductRatingProps {
  rating: number;
  reviewCount?: number;
  size?: "small" | "medium" | "large";
  showCount?: boolean;
  className?: string;
}

const ProductRating = ({ 
  rating, 
  reviewCount = 0,
  size = "medium",
  showCount = true,
  className 
}: ProductRatingProps) => {
  const sizeClasses = {
    small: "w-3 h-3",
    medium: "w-4 h-4", 
    large: "w-5 h-5"
  };

  const textSizeClasses = {
    small: "text-xs",
    medium: "text-sm",
    large: "text-base"
  };

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star
            key={i}
            className={cn(sizeClasses[size], "fill-yellow-400 text-yellow-400")}
          />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <Star className={cn(sizeClasses[size], "text-gray-300")} />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className={cn(sizeClasses[size], "fill-yellow-400 text-yellow-400")} />
            </div>
          </div>
        );
      } else {
        stars.push(
          <Star
            key={i}
            className={cn(sizeClasses[size], "text-gray-300")}
          />
        );
      }
    }
    return stars;
  };

  if (rating === 0 && reviewCount === 0) {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        <span className={cn("text-gray-400", textSizeClasses[size])}>
          Chưa có đánh giá
        </span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center gap-0.5">
        {renderStars()}
      </div>
      <span className={cn("font-medium text-gray-700", textSizeClasses[size])}>
        {rating.toFixed(1)}
      </span>
      {showCount && reviewCount > 0 && (
        <span className={cn("text-gray-500", textSizeClasses[size])}>
          ({reviewCount} đánh giá)
        </span>
      )}
    </div>
  );
};

export default ProductRating;
