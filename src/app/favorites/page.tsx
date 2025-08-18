'use client';

import React from 'react';
import { Heart, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import Container from '../../components/Container';
import Title from '../../components/Title';
import ProductCard from '../../components/ProductCard';
import useUser from '../../hooks/useUser';
import { useFavorites } from '../../hooks/useFavorites';

export default function FavoritesPage() {
  const { user } = useUser();
  const { favorites, loading, error, removeFavorite, refetch } = useFavorites();
  
  // Create favorite status map - all items in favorites are favorite by definition
  const favoriteStatus = React.useMemo(() => {
    const status: Record<number, boolean> = {};
    favorites.forEach(product => {
      status[product.id] = true;
    });
    return status;
  }, [favorites]);
  
  const handleFavoriteChange = React.useCallback((productId: number, isFavorite: boolean) => {
    // If unfavorite, remove from favorites
    if (!isFavorite) {
      removeFavorite(productId);
    }
    // Note: We don't handle adding favorites here since this page only shows existing favorites
  }, [removeFavorite]);

  if (loading) {
    return (
      <Container className="py-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-shop_dark_green mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải danh sách yêu thích...</p>
          </div>
        </div>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container className="py-10">
        <div className="text-center">
          <Heart size={64} className="mx-auto text-gray-300 mb-4" />
          <Title className="text-2xl mb-4">Bạn cần đăng nhập</Title>
          <p className="text-gray-600 mb-6">
            Vui lòng đăng nhập để xem danh sách sản phẩm yêu thích của bạn
          </p>
          <Link
            href="/login"
            className="inline-flex items-center px-6 py-3 bg-shop_dark_green text-white rounded-lg hover:bg-shop_dark_green/90 transition-colors"
          >
            Đăng nhập ngay
          </Link>
        </div>
      </Container>
    );
  }

  if (!user.buyer && user.role !== 'buyer') {
    return (
      <Container className="py-10">
        <div className="text-center">
          <Heart size={64} className="mx-auto text-gray-300 mb-4" />
          <Title className="text-2xl mb-4">Tính năng không khả dụng</Title>
          <p className="text-gray-600">
            Chỉ có khách hàng mới có thể sử dụng tính năng yêu thích sản phẩm
          </p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-10">
        <div className="text-center">
          <Heart size={64} className="mx-auto text-red-300 mb-4" />
          <Title className="text-2xl mb-4 text-red-600">Đã xảy ra lỗi</Title>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => refetch(true)}
            className="inline-flex items-center px-6 py-3 bg-shop_dark_green text-white rounded-lg hover:bg-shop_dark_green/90 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-10">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Heart size={32} className="text-red-500" />
          <Title className="text-3xl">Sản phẩm yêu thích</Title>
        </div>
        <p className="text-gray-600">
          Bạn có {favorites.length} sản phẩm trong danh sách yêu thích
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-16">
          <Heart size={64} className="mx-auto text-gray-300 mb-4" />
          <Title className="text-2xl mb-4">Chưa có sản phẩm yêu thích</Title>
          <p className="text-gray-600 mb-6">
            Hãy thêm những sản phẩm bạn thích vào danh sách yêu thích để dễ dàng tìm kiếm sau này
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 bg-shop_dark_green text-white rounded-lg hover:bg-shop_dark_green/90 transition-colors"
          >
            <ShoppingBag size={20} />
            Khám phá sản phẩm
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 animate-in fade-in duration-500">
          {favorites.map((product) => {
            console.log('Product from favorites API:', product); // Debug log
            console.log('Product imageUrl:', product.imageUrl); // Debug log
            
            return (
              <ProductCard 
                key={product.id} 
                product={product} 
                isFavorite={favoriteStatus[product.id]}
                onFavoriteChange={handleFavoriteChange}
              />
            );
          })}
        </div>
      )}
    </Container>
  );
}
