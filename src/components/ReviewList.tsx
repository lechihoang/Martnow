import React from 'react';
import StarRating from './StarRating';

interface Review {
  id: number;
  rating: number;
  comment?: string;
  createdAt: Date;
  buyerId: string;
  buyerName: string;
  buyerAvatar?: string;
}

interface ReviewListProps {
  reviews: Review[];
  loading?: boolean;
  error?: string | null;
  currentBuyerId?: string;
  onEditReview?: (review: Review) => void;
  onDeleteReview?: (reviewId: number) => void;
  onHelpfulClick?: (reviewId: number) => void;
  onRetry?: () => void;
  hideActions?: boolean;
}

const ReviewList: React.FC<ReviewListProps> = ({
  reviews,
  loading = false,
  error = null,
  currentBuyerId,
  onEditReview,
  onDeleteReview,
  onHelpfulClick,
  onRetry,
  hideActions = false
}) => {
  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span className="text-red-500 text-3xl">⚠️</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Có lỗi xảy ra</h3>
        <p className="text-red-500 mb-4">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            Thử lại
          </button>
        )}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
          <span className="text-gray-400 text-4xl">📝</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có đánh giá nào</h3>
        <p className="text-gray-600 mb-4">Hãy là người đầu tiên đánh giá sản phẩm này!</p>
        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
          🚀 Chia sẻ trải nghiệm của bạn
        </div>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    try {
      return new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(new Date(date));
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Ngày không hợp lệ';
    }
  };

  return (
    <div className="space-y-6">
      {reviews.map(review => (
        <div key={review.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {review.buyerAvatar ? (
                <img
                  src={review.buyerAvatar}
                  alt={review.buyerName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center border-2 border-gray-100 ${review.buyerAvatar ? 'hidden' : ''}`}>
                <span className="text-blue-600 font-bold text-lg">
                  {review.buyerName.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>

            {/* Review content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900 text-lg">
                  {review.buyerName}
                </h4>
                
                {/* Action buttons for owner */}
                {!hideActions && currentBuyerId === review.buyerId && (
                  <div className="flex gap-3">
                    {onEditReview && (
                      <button
                        onClick={() => onEditReview(review)}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors px-3 py-1 rounded-md hover:bg-blue-50"
                      >
                        ✏️ Sửa
                      </button>
                    )}
                    {onDeleteReview && (
                      <button
                        onClick={() => {
                          if (window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
                            onDeleteReview(review.id);
                          }
                        }}
                        className="text-sm text-red-600 hover:text-red-800 font-medium transition-colors px-3 py-1 rounded-md hover:bg-red-50"
                      >
                        🗑️ Xóa
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-3">
                <StarRating rating={review.rating} readonly size="md" />
                <span className="text-sm text-gray-500 font-medium">
                  {formatDate(review.createdAt)}
                </span>
              </div>

              {/* Comment */}
              {review.comment && (
                <p className="text-gray-700 text-base leading-relaxed mb-4">
                  {review.comment}
                </p>
              )}

            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReviewList;
