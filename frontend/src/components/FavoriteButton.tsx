import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import useStore from '@/stores/store';
import { ProductResponseDto } from '@/types/dtos';
import { User } from '@supabase/supabase-js';
import { UserProfile } from '@/types/auth';
import toast from 'react-hot-toast';

interface FavoriteButtonProps {
  product: ProductResponseDto;
  className?: string;
  user: User | null;
  userProfile?: UserProfile | null;
  loading: boolean;
  variant?: 'icon' | 'button'; // New prop to control display style
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  product,
  className = '',
  user,
  userProfile,
  loading,
  variant = 'icon'
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { isFavorite, addToFavorites } = useStore();

  // Early return if product is invalid
  if (!product || !product.id) {
    return null;
  }

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoading) return;

    if (!user) {
      toast.error('Bạn cần đăng nhập để sử dụng tính năng yêu thích');
      return;
    }

    // Check if user is seller - show error message
    if (userProfile?.role === 'SELLER') {
      toast.error('Seller không thể thêm sản phẩm vào yêu thích. Bạn chỉ có thể bán sản phẩm.');
      return;
    }

    // Check if user is buyer
    if (userProfile?.role !== 'BUYER') {
      toast.error('Chỉ có buyer mới có thể thêm sản phẩm vào yêu thích.');
      return;
    }

    setIsLoading(true);

    try {
      const wasAlreadyFavorite = isFavorite(product.id);
      await addToFavorites(product);

      if (wasAlreadyFavorite) {
        toast.success('Đã xóa khỏi yêu thích');
      } else {
        toast.success('Đã thêm vào yêu thích!');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Có lỗi xảy ra khi cập nhật yêu thích!');
    } finally {
      setIsLoading(false);
    }
  };

  // Nếu đang loading user thì hiển thị loading
  if (loading) {
    return (
      <div className={`flex items-center justify-center p-2 ${className}`}>
        <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Always show the button, validation is handled in click handler

  const favorite = isFavorite(product.id);

  if (variant === 'button') {
    return (
      <button
        onClick={handleToggleFavorite}
        disabled={isLoading}
        className={className}
        title={favorite ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <Heart
              size={20}
              fill={favorite ? 'currentColor' : 'none'}
              className={`transition-all duration-200 ${favorite ? 'text-red-500' : 'text-gray-400'}`}
            />
            <span>{favorite ? 'Đã yêu thích' : 'Thêm vào yêu thích'}</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={isLoading}
      className={`
        flex items-center justify-center w-8 h-8 bg-white rounded-full transition-all duration-200 shadow-sm
        ${favorite
          ? 'text-red-500 hover:text-red-600'
          : 'text-gray-400 hover:text-red-500'
        }
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}
        ${className}
      `}
      title={favorite ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <Heart
          size={16}
          fill={favorite ? 'currentColor' : 'none'}
          className="transition-all duration-200"
        />
      )}
    </button>
  );
};

export default FavoriteButton;
