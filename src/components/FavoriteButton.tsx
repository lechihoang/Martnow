import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import useUser from '../hooks/useUser';
import { favoritesApi } from '../lib/api';

interface FavoriteButtonProps {
  productId: number;
  initialIsFavorite?: boolean;
  onFavoriteChange?: (productId: number, isFavorite: boolean) => void;
  className?: string;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ 
  productId, 
  initialIsFavorite,
  onFavoriteChange,
  className = '' 
}) => {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite ?? false);
  const [isLoading, setIsLoading] = useState(false);
  const { user, loading } = useUser();

  // Chỉ kiểm tra favorite status nếu không có initialIsFavorite
  useEffect(() => {
    if (initialIsFavorite === undefined && user && (user.buyer || user.buyerInfo)) {
      checkIsFavorite();
    }
  }, [productId, user, initialIsFavorite]);

  // Cập nhật state khi initialIsFavorite thay đổi
  useEffect(() => {
    if (initialIsFavorite !== undefined) {
      setIsFavorite(initialIsFavorite);
    }
  }, [initialIsFavorite]);

  const checkIsFavorite = async () => {
    try {
      const isFav = await favoritesApi.isFavorite(productId);
      setIsFavorite(isFav);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault(); // Ngăn Link navigation
    e.stopPropagation();

    // Kiểm tra user có tồn tại và có thông tin buyer không
    if (!user) {
      alert('Bạn cần đăng nhập để sử dụng tính năng yêu thích');
      return;
    }

    if (!user.buyer && !user.buyerInfo) {
      alert('Chỉ khách hàng mới có thể sử dụng tính năng yêu thích');
      return;
    }

    setIsLoading(true);

    try {
      if (isFavorite) {
        await favoritesApi.removeFromFavorites(productId);
        setIsFavorite(false);
        onFavoriteChange?.(productId, false);
      } else {
        await favoritesApi.addToFavorites(productId);
        setIsFavorite(true);
        onFavoriteChange?.(productId, true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Có lỗi xảy ra khi thực hiện thao tác');
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

  // Nếu user chưa đăng nhập hoặc không phải buyer thì không hiển thị nút
  if (!user || (!user.buyer && !user.buyerInfo)) {
    return null;
  }

  return (
    <button
      onClick={toggleFavorite}
      disabled={isLoading}
      className={`
        flex items-center justify-center p-2 rounded-full transition-all duration-200
        ${isFavorite 
          ? 'text-red-500 hover:text-red-600 hover:bg-red-50' 
          : 'text-gray-400 hover:text-red-500 hover:bg-gray-50'
        }
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}
        ${className}
      `}
      title={isFavorite ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
    >
      <Heart 
        size={20} 
        fill={isFavorite ? 'currentColor' : 'none'}
        className="transition-all duration-200"
      />
    </button>
  );
};

export default FavoriteButton;
