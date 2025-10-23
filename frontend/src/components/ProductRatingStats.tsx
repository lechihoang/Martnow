import React from 'react';
import StarRating from './StarRating';

interface ProductRatingStatsProps {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: { [key: number]: number };
  className?: string;
}

const ProductRatingStats: React.FC<ProductRatingStatsProps> = ({
  averageRating,
  totalReviews,
  ratingDistribution,
  className = ''
}) => {
  // Always show the chart, even with 0 reviews

  return (
    <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
      <div className="flex items-center gap-4 mb-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900">
            {totalReviews === 0 ? '0.0' : averageRating.toFixed(1)}
          </div>
          <StarRating rating={averageRating} readonly />
          <p className="text-sm text-gray-600 mt-1">
            {totalReviews} đánh giá{totalReviews === 0 ? ' (chưa có)' : ''}
          </p>
        </div>

        <div className="flex-1">
          {[5, 4, 3, 2, 1].map(star => {
            const count = ratingDistribution[star] || 0;
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            
            return (
              <div key={star} className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium w-3">{star}</span>
                <span className="text-yellow-400">⭐</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-600 w-8">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProductRatingStats;
