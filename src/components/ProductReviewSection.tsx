import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { reviewApi } from '@/lib/api';
import { ReviewResponseDto } from '@/types/dtos';
import { UserRole } from '@/types/entities';
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';
import ProductRatingStats from './ProductRatingStats';
import useUser from '@/hooks/useUser';

interface ProductReviewSectionProps {
  productId: number;
  className?: string;
}

const ProductReviewSection: React.FC<ProductReviewSectionProps> = ({
  productId,
  className = ''
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
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewResponseDto | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const userData = useUser();

  useEffect(() => {
    fetchReviews();
    fetchRatingStats();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const reviewsData = await reviewApi.getProductReviews(productId);
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      // Set empty array instead of keeping loading state
      setReviews([]);
    }
  };

  const fetchRatingStats = async () => {
    try {
      const statsData = await reviewApi.getProductRatingStats(productId);
      setRatingStats(statsData);
    } catch (error) {
      console.error('Error fetching rating stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (reviewData: { rating: number; comment: string }) => {
    try {
      setSubmitting(true);
      
      if (editingReview) {
        // Update existing review
        await reviewApi.updateReview(editingReview.id, reviewData);
        toast.success('Cập nhật đánh giá thành công!');
      } else {
        // Create new review
        await reviewApi.createReview({
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
          err?.response?.data?.message?.includes('đã đánh giá')) {
        toast.error('Bạn đã đánh giá sản phẩm này rồi! Bạn có thể chỉnh sửa đánh giá hiện có.');
      } else {
        toast.error('Có lỗi xảy ra. Vui lòng thử lại.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditReview = (review: ReviewResponseDto) => {
    setEditingReview(review);
    setShowReviewForm(true);
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm('Bạn có chắc muốn xóa đánh giá này?')) {
      return;
    }

    try {
      await reviewApi.deleteReview(reviewId);
      await Promise.all([fetchReviews(), fetchRatingStats()]);
      toast.success('Xóa đánh giá thành công!');
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Có lỗi xảy ra khi xóa đánh giá.');
    }
  };

  const handleCancelReview = () => {
    setShowReviewForm(false);
    setEditingReview(null);
  };

  const handleHelpfulClick = async (reviewId: number) => {
    try {
      await reviewApi.markReviewHelpful(reviewId);
      // Refresh reviews to show updated helpful count
      await fetchReviews();
    } catch (error) {
      console.error('Error marking review as helpful:', error);
      toast.error('Có lỗi xảy ra khi đánh dấu hữu ích.');
    }
  };

  const canReview = userData.user?.role === UserRole.BUYER && !userData.loading;
  const currentBuyerId = userData.user?.buyer?.id;
  const hasUserReviewed = currentBuyerId && reviews.some(review => review.buyerId === currentBuyerId);

  console.log('Review debugging:', {
    userRole: userData.user?.role,
    expectedRole: UserRole.BUYER,
    canReview,
    userLoggedIn: !!userData.user,
    loading: userData.loading,
    currentBuyerId,
    userBuyer: userData.user?.buyer,
    reviews: reviews.map(r => ({ id: r.id, buyerId: r.buyerId })),
    hasUserReviewed
  });

  if (loading) {
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
        
        {canReview && !hasUserReviewed && !showReviewForm && (
          <button
            onClick={() => setShowReviewForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Viết đánh giá
          </button>
        )}

        {!userData.user && !userData.loading && (
          <div className="text-sm text-gray-600">
            <a href="/login" className="text-blue-600 hover:text-blue-700">
              Đăng nhập
            </a> để viết đánh giá
          </div>
        )}

        {userData.user && userData.user.role !== UserRole.BUYER && (
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

      {/* Review Form */}
      {showReviewForm && (
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
      )}

      {/* Reviews List */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Tất cả đánh giá ({ratingStats.totalReviews})
        </h3>
        <ReviewList
          reviews={reviews.map(review => ({
            id: review.id,
            rating: review.rating,
            comment: review.comment,
            createdAt: review.createdAt,
            buyerId: review.buyerId,
            buyerName: review.buyerName,
            buyerAvatar: review.buyerAvatar,
            helpfulCount: review.helpfulCount
          }))}
          currentBuyerId={currentBuyerId}
          onEditReview={(review) => handleEditReview(reviews.find(r => r.id === review.id)!)}
          onDeleteReview={handleDeleteReview}
          onHelpfulClick={handleHelpfulClick}
        />
      </div>
    </div>
  );
};

export default ProductReviewSection;
