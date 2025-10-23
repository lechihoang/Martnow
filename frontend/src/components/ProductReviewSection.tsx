import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { reviewApi } from '@/lib/api';
import { ReviewResponseDto } from '@/types/dtos';
import { UserRole } from '@/types/entities';
import { UserProfile } from '@/types/auth';
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';
import ProductRatingStats from './ProductRatingStats';

interface ProductReviewSectionProps {
  productId: number;
  className?: string;
  userProfile: UserProfile | null;
}

const ProductReviewSection: React.FC<ProductReviewSectionProps> = ({
  productId,
  className = '',
  userProfile
}) => {
  const [reviews, setReviews] = useState<ReviewResponseDto[]>([]);
  const [ratingStats, setRatingStats] = useState<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: { [key: number]: number };
  }>({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewResponseDto | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = useCallback(async () => {
    try {
      const reviewsData = await reviewApi.getProductReviews(productId);
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
    }
  }, [productId]);

  const fetchRatingStats = useCallback(async () => {
    try {
      const statsData = await reviewApi.getProductRatingStats(productId);
      setRatingStats(statsData);
    } catch (error) {
      console.error('Error fetching rating stats:', error);
    } finally {
      setReviewsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
    fetchRatingStats();
  }, [fetchReviews, fetchRatingStats]);

  const handleSubmitReview = async (reviewData: { rating: number; comment: string }) => {
    try {
      setSubmitting(true);
      
      if (editingReview) {
        // Update existing review
        await reviewApi.updateReview(editingReview.id, reviewData);
        toast.success('Cập nhật đánh giá thành công!');
      } else {
        // Create new review
        await reviewApi.createReview(productId, {
          productId,
          rating: reviewData.rating,
          comment: reviewData.comment,
        });
        toast.success('Gửi đánh giá thành công!');
      }
      
      // Refresh data
      await Promise.all([fetchReviews(), fetchRatingStats()]);
      
      // Close form
      setShowReviewForm(false);
      setEditingReview(null);
      
    } catch (error: unknown) {
      console.error('Error submitting review:', error);
      
      const err = error as Error & {
        response?: {
          status: number;
          data: { message: string };
        };
      };
      
      // Handle specific error for duplicate review
      if (err?.response?.status === 400 && 
          err.response.data.message?.includes('already reviewed')) {
        toast.error('Bạn đã đánh giá sản phẩm này rồi!');
      } else {
        toast.error('Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelReview = () => {
    setShowReviewForm(false);
    setEditingReview(null);
  };

  const handleEditReview = (review: ReviewResponseDto) => {
    setEditingReview(review);
    setShowReviewForm(true);
  };

  const handleDeleteReview = async (reviewId: number) => {
    try {
      await reviewApi.deleteReview(reviewId);
      toast.success('Xóa đánh giá thành công!');
      await Promise.all([fetchReviews(), fetchRatingStats()]);
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Không thể xóa đánh giá. Vui lòng thử lại.');
    }
  };


  // Check if current user can review
  const canReview = userProfile && userProfile.role === UserRole.BUYER;

  // Check if current user has already reviewed
  const currentBuyerId = userProfile?.id;
  const userReview = currentBuyerId ?
    reviews.find(r => String(r.buyerId) === String(currentBuyerId)) : undefined;
  const hasUserReviewed = !!userReview;


  if (reviewsLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Đánh giá sản phẩm
        </h2>

        {!userProfile && (
          <div className="text-sm text-gray-600">
            <a href="/auth/login" className="text-orange-600 hover:text-orange-700">
              Đăng nhập
            </a> để viết đánh giá
          </div>
        )}

        {userProfile && userProfile.role !== UserRole.BUYER && (
          <div className="text-sm text-gray-600">
            Chỉ khách hàng mới có thể viết đánh giá
          </div>
        )}
      </div>

      {/* Rating Stats */}
      <ProductRatingStats
        averageRating={ratingStats.averageRating}
        totalReviews={ratingStats.totalReviews}
        ratingDistribution={ratingStats.ratingDistribution}
      />

      {/* User's Review Section */}
      {canReview && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Đánh giá của bạn</h3>
            {hasUserReviewed && userReview && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditReview(userReview)}
                  className="px-3 py-1 text-sm text-orange-600 hover:text-orange-700 border border-orange-300 rounded hover:bg-orange-100 transition-colors"
                >
                  Sửa
                </button>
                <button
                  onClick={() => handleDeleteReview(userReview.id)}
                  className="px-3 py-1 text-sm text-red-600 hover:text-red-700 border border-red-300 rounded hover:bg-red-100 transition-colors"
                >
                  Xóa
                </button>
              </div>
            )}
          </div>

          {hasUserReviewed && userReview ? (
            <ReviewList
              reviews={[{
                id: userReview.id,
                rating: userReview.rating,
                comment: userReview.comment,
                createdAt: userReview.createdAt,
                buyerId: userReview.buyerId,
                buyerName: userReview.buyerName,
                buyerAvatar: userReview.buyerAvatar,
              }]}
              currentBuyerId={currentBuyerId}
              onEditReview={() => {}}
              onDeleteReview={() => {}}
              onHelpfulClick={undefined}
              hideActions={true}
            />
          ) : (
            !showReviewForm && (
              <div className="text-center py-6">
                <p className="text-gray-600 mb-3">Bạn chưa đánh giá sản phẩm này</p>
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="btn-primary"
                >
                  Viết đánh giá
                </button>
              </div>
            )
          )}

          {/* Review Form */}
          {showReviewForm && (
            <div className="mt-4 pt-4 border-t border-orange-200">
              <ReviewForm
                productId={productId}
                onSubmit={handleSubmitReview}
                onCancel={handleCancelReview}
                loading={submitting}
                initialData={editingReview ? {
                  rating: editingReview.rating,
                  comment: editingReview.comment || ''
                } : undefined}
              />
            </div>
          )}
        </div>
      )}

      {/* All Reviews Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Tất cả đánh giá ({ratingStats.totalReviews})
        </h3>
        {reviews.length > 0 ? (
          <ReviewList
            reviews={reviews.map(review => ({
              id: review.id,
              rating: review.rating,
              comment: review.comment,
              createdAt: review.createdAt,
              buyerId: review.buyerId,
              buyerName: review.buyerName,
              buyerAvatar: review.buyerAvatar,
            }))}
            currentBuyerId={currentBuyerId}
            onEditReview={() => {}}
            onDeleteReview={() => {}}
            onHelpfulClick={undefined}
            hideActions={true}
          />
        ) : (
          <div className="text-center py-8 text-gray-500">
            Chưa có đánh giá nào
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductReviewSection;
