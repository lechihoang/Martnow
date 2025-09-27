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
  onSubmit,
  onCancel,
  loading = false,
  initialData
}) => {
  const [rating, setRating] = useState(initialData?.rating || 0);
  const [comment, setComment] = useState(initialData?.comment || '');
  const [errors, setErrors] = useState<{ rating?: string; comment?: string }>({});

  const validateForm = () => {
    const newErrors: { rating?: string; comment?: string } = {};
    
    if (rating === 0) {
      newErrors.rating = 'Vui lòng chọn số sao đánh giá';
    }
    
    if (comment.trim().length > 500) {
      newErrors.comment = 'Nhận xét không được vượt quá 500 ký tự';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    onSubmit({ rating, comment: comment.trim() });
  };

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
    if (errors.rating) {
      setErrors(prev => ({ ...prev, rating: undefined }));
    }
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setComment(value);
    if (errors.comment) {
      setErrors(prev => ({ ...prev, comment: undefined }));
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {initialData ? 'Chỉnh sửa đánh giá' : 'Đánh giá sản phẩm'}
        </h3>
        <p className="text-gray-600">
          {initialData ? 'Cập nhật cảm nhận của bạn về sản phẩm' : 'Chia sẻ trải nghiệm của bạn với cộng đồng'}
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating */}
        <div className="text-center">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Đánh giá của bạn *
          </label>
          <div className="flex items-center justify-center gap-3">
            <StarRating
              rating={rating}
              onRatingChange={handleRatingChange}
              size="lg"
            />
            <span className="text-lg font-semibold text-blue-600">
              {rating > 0 && `${rating} sao`}
            </span>
          </div>
          {errors.rating && (
            <p className="text-red-500 text-sm mt-2">{errors.rating}</p>
          )}
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Nhận xét (tùy chọn)
          </label>
          <textarea
            value={comment}
            onChange={handleCommentChange}
            rows={5}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors ${
              errors.comment ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
            }`}
            placeholder="Chia sẻ cảm nhận của bạn về sản phẩm... (tối đa 500 ký tự)"
            maxLength={500}
          />
          <div className="flex justify-between items-center mt-2">
            <p className={`text-sm ${errors.comment ? 'text-red-500' : 'text-gray-500'}`}>
              {comment.length}/500 ký tự
            </p>
            {errors.comment && (
              <p className="text-red-500 text-sm font-medium">{errors.comment}</p>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            disabled={loading}
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading || rating === 0}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium shadow-sm hover:shadow-md"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Đang lưu...</span>
              </div>
            ) : (
              initialData ? 'Cập nhật đánh giá' : 'Gửi đánh giá'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;
