import React, { useState } from 'react';
import StarRating from './StarRating';

interface ReviewFormProps {
  productId: number;
  onSubmit: (reviewData: { rating: number; comment: string }) => void;
  onCancel: () => void;
  loading?: boolean;
  initialData?: {
    rating: number;
    comment: string;
  };
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  productId,
  onSubmit,
  onCancel,
  loading = false,
  initialData
}) => {
  const [rating, setRating] = useState(initialData?.rating || 0);
  const [comment, setComment] = useState(initialData?.comment || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Vui lòng chọn số sao đánh giá');
      return;
    }
    onSubmit({ rating, comment });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {initialData ? 'Chỉnh sửa đánh giá' : 'Đánh giá sản phẩm'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Đánh giá của bạn *
          </label>
          <div className="flex items-center gap-2">
            <StarRating
              rating={rating}
              onRatingChange={setRating}
              size="lg"
            />
            <span className="text-sm text-gray-600">
              {rating > 0 && `${rating} sao`}
            </span>
          </div>
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nhận xét (tùy chọn)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-1">
            {comment.length}/500 ký tự
          </p>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            disabled={loading}
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading || rating === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Đang lưu...' : (initialData ? 'Cập nhật đánh giá' : 'Gửi đánh giá')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;
