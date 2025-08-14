import React from 'react';
import StarRating from './StarRating';

interface Review {
  id: number;
  rating: number;
  comment?: string;
  createdAt: Date;
  buyerId: number;
  buyerName: string;
  buyerAvatar?: string;
  helpfulCount?: number;
}

interface ReviewListProps {
  reviews: Review[];
  loading?: boolean;
  currentBuyerId?: number;
  onEditReview?: (review: Review) => void;
  onDeleteReview?: (reviewId: number) => void;
  onHelpfulClick?: (reviewId: number) => void;
}

const ReviewList: React.FC<ReviewListProps> = ({
  reviews,
  loading = false,
  currentBuyerId,
  onEditReview,
  onDeleteReview,
  onHelpfulClick
}) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 text-4xl mb-2">📝</div>
        <p className="text-gray-500">Chưa có đánh giá nào</p>
        <p className="text-sm text-gray-400">Hãy là người đầu tiên đánh giá sản phẩm này!</p>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  };

  return (
    <div className="space-y-6">
      {reviews.map(review => (
        <div key={review.id} className="border-b border-gray-100 pb-6 last:border-b-0">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {review.buyerAvatar ? (
                <img
                  src={review.buyerAvatar}
                  alt={review.buyerName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 font-medium">
                    {review.buyerName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Review content */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-medium text-gray-900">
                  {review.buyerName}
                </h4>
                
                {/* Action buttons for owner */}
                {currentBuyerId === review.buyerId && (
                  <div className="flex gap-2">
                    {onEditReview && (
                      <button
                        onClick={() => onEditReview(review)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Sửa
                      </button>
                    )}
                    {onDeleteReview && (
                      <button
                        onClick={() => onDeleteReview(review.id)}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-2">
                <StarRating rating={review.rating} readonly size="sm" />
                <span className="text-sm text-gray-600">
                  {formatDate(review.createdAt)}
                </span>
              </div>

              {/* Comment */}
              {review.comment && (
                <p className="text-gray-700 text-sm leading-relaxed">
                  {review.comment}
                </p>
              )}

              {/* Helpful Actions */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  {onHelpfulClick && (
                    <button 
                      className="flex items-center gap-1 hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                      onClick={() => onHelpfulClick(review.id)}
                    >
                      <span>👍</span>
                      <span>Hữu ích ({review.helpfulCount || 0})</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReviewList;
