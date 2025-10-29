"use client";

import React, { useEffect } from 'react';
import Image from 'next/image';
import Container from '@/components/Container';
import useStore from '@/stores/store';
import { useAuth } from '@/hooks/useAuth';
import { getUserProfile } from '@/lib/api';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PriceView from '@/components/PriceView';
import toast from 'react-hot-toast';
import { User, Product } from '@/types/entities';
import { LoadingSpinner } from '@/components/ui';

const FavoritesPage: React.FC = () => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const {
    favoriteProducts,
    getFavoritesCount,
    addToFavorites,
    addToCart,
    fetchFavoritesFromBackend
  } = useStore();

  // Fetch user profile when user changes
  React.useEffect(() => {
    setLoading(true);
    if (user) {
      getUserProfile().then(profile => {
        setUserProfile(profile);
        setLoading(false);
      }).catch(() => {
        setLoading(false);
      });
    } else {
      setUserProfile(null);
      setLoading(false);
    }
  }, [user]);

  // Fetch favorites from backend on mount
  useEffect(() => {
    if (user && userProfile && userProfile.role === 'BUYER') {
      fetchFavoritesFromBackend();
    }
  }, [user, userProfile, fetchFavoritesFromBackend]);

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    toast.success(`Đã thêm ${product.name} vào giỏ hàng`);
  };

  const handleRemoveFavorite = async (product: Product) => {
    try {
      await addToFavorites(product); // This will toggle and remove from favorites
      toast.success(`Đã xóa ${product.name} khỏi danh sách yêu thích`);
    } catch {
      toast.error('Có lỗi xảy ra khi xóa khỏi yêu thích');
    }
  };


  // Show loading state while fetching user data
  if (loading) {
    return (
      <Container>
        <div className="min-h-screen bg-white">
          <LoadingSpinner size="xl" message="Đang tải danh sách yêu thích của bạn..." />
        </div>
      </Container>
    );
  }

  // Redirect if not logged in or not a buyer
  if (!user || !userProfile || userProfile.role !== 'BUYER') {
    return (
      <Container>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Truy cập bị từ chối
            </h2>
            <p className="text-gray-600">
              Chỉ khách hàng mới có thể xem danh sách yêu thích
            </p>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-red-500" />
            <h1 className="text-3xl font-bold text-gray-900">
              Sản phẩm yêu thích
            </h1>
            <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium">
              {getFavoritesCount()} sản phẩm
            </span>
          </div>
        </div>

        {/* Content */}
        {favoriteProducts.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Chưa có sản phẩm yêu thích
            </h2>
            <p className="text-gray-600 mb-8">
              Hãy thêm sản phẩm vào danh sách yêu thích để dễ dàng theo dõi
            </p>
            <Button
              onClick={() => window.history.back()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Khám phá sản phẩm
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favoriteProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
              >
                {/* Product Image */}
                <div className="relative h-48 bg-gray-200">
                  <Image
                    src={product.imageUrl || '/default-product.jpg'}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                  <button
                    onClick={() => handleRemoveFavorite(product)}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                    title="Bỏ yêu thích"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    {product.seller?.user?.name || product.seller?.shopName || 'Unknown Seller'}
                  </p>

                  <div className="flex items-center justify-between mb-3">
                    <PriceView 
                      price={product.price} 
                      discount={product.discount}
                      className="text-lg font-bold"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleAddToCart(product)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      size="sm"
                    >
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Thêm vào giỏ
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
};

export default FavoritesPage;
