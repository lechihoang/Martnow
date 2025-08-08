'use client';

import React, { useState, useEffect } from 'react';
import { Heart, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import Container from '../../components/Container';
import Title from '../../components/Title';
import ProductCard from '../../components/ProductCard';
import useUser from '../../hooks/useUser';
import { Product, UserRole } from '../../types/entities';
import { ProductResponseDto } from '../../types/dtos';
import { favoritesApi } from '../../lib/api';

// Sử dụng cùng mapping function như shop page
const mapProductResponseToProduct = (productDto: ProductResponseDto): Product => {
  return {
    id: productDto.id,
    name: productDto.name,
    description: productDto.description || "",
    price: productDto.price,
    imageUrl: productDto.imageUrl || "/images/banhmi.jpeg", // Same fallback như shop page
    isAvailable: productDto.isAvailable,
    stock: productDto.stock,
    discount: productDto.discount,
    createdAt: productDto.createdAt,
    updatedAt: productDto.updatedAt,
    sellerId: productDto.sellerId,
    categoryId: productDto.categoryId,
    seller: {
      id: productDto.seller.id,
      userId: productDto.seller.id,
      user: {
        id: productDto.seller.id,
        name: productDto.seller.user.name,
        username: productDto.seller.user.username,
        email: "",
        role: UserRole.SELLER,
        password: "",
        createdAt: new Date(),
        updatedAt: new Date(),
        reviews: [],
      },
      shopName: productDto.seller.shopName || "",
      shopAddress: productDto.seller.shopAddress || "",
      shopPhone: "",
      description: "",
      products: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    category: {
      id: productDto.category.id,
      name: productDto.category.name,
      description: productDto.category.description || "",
      products: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    images: [],
    reviews: [],
    orderItems: [],
  };
};

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [favoriteStatus, setFavoriteStatus] = useState<Record<number, boolean>>({});
  const [favoritesLoading, setFavoritesLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  // Tổng loading state
  const loading = favoritesLoading || statusLoading;

  useEffect(() => {
    if (user && user.buyer) {
      fetchFavorites();
    } else if (user && !user.buyer) {
      setFavoritesLoading(false);
    }
  }, [user]);

  const fetchFavorites = async () => {
    try {
      setFavoritesLoading(true);
      setStatusLoading(true);
      
      const productDtos = await favoritesApi.getFavorites();
      const mappedProducts = productDtos.map(mapProductResponseToProduct);
      setFavorites(mappedProducts);
      setFavoritesLoading(false);
      
      // Tất cả products trong favorites đều là favorite = true
      const initialFavoriteStatus: Record<number, boolean> = {};
      mappedProducts.forEach(product => {
        initialFavoriteStatus[product.id] = true;
      });
      setFavoriteStatus(initialFavoriteStatus);
      setStatusLoading(false);
    } catch (err) {
      setError('Đã xảy ra lỗi khi tải danh sách yêu thích');
      console.error('Error fetching favorites:', err);
      setFavoritesLoading(false);
      setStatusLoading(false);
    }
  };

  const handleFavoriteChange = (productId: number, isFavorite: boolean) => {
    setFavoriteStatus(prev => ({
      ...prev,
      [productId]: isFavorite
    }));
    
    // Nếu unfavorite thì remove khỏi list
    if (!isFavorite) {
      setFavorites(prev => prev.filter(product => product.id !== productId));
    }
  };

  if (loading) {
    return (
      <Container className="py-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-shop_dark_green mx-auto mb-4"></div>
            <p className="text-gray-600">
              {favoritesLoading ? 'Đang tải danh sách yêu thích...' : 
               statusLoading ? 'Đang xử lý trạng thái...' : 
               'Đang tải...'}
            </p>
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

  if (!user.buyer) {
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
            onClick={fetchFavorites}
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
