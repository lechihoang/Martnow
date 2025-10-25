'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { productApi, getUserProfile } from '@/lib/api';
import { ProductResponseDto } from '@/types/dtos';
import ProductGrid from './ProductGrid';
import { PageState } from './ui';
import { useAuth } from '@/hooks/useAuth';
import useStore from '@/stores/store';
import { User } from '@/types/entities';
import Link from 'next/link';

const FeaturedProducts: React.FC = () => {
  const { user } = useAuth();
  const { isFavorite } = useStore();
  const [products, setProducts] = useState<ProductResponseDto[]>([]);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productsData, profileData] = await Promise.all([
          productApi.getPopularProducts(8), // Lấy 8 sản phẩm nổi bật
          user && user.aud === 'authenticated' ? getUserProfile() : Promise.resolve(null)
        ]);

        setProducts(productsData);
        setUserProfile(profileData);
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Create favorite status map
  const favoriteStatus = useMemo(() => {
    const status: Record<number, boolean> = {};
    products.forEach(product => {
      status[product.id] = isFavorite(product.id);
    });
    return status;
  }, [products, isFavorite]);

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sản phẩm nổi bật</h2>
          <p className="text-gray-600">Những sản phẩm được yêu thích nhất</p>
        </div>

        <PageState
          loading={loading}
          empty={products.length === 0 && !loading}
          emptyMessage="Chưa có sản phẩm nổi bật"
          loadingMessage="Đang tải sản phẩm..."
        >
          <ProductGrid
            products={products}
            favoriteStatus={favoriteStatus}
            user={user}
            userProfile={userProfile}
            loading={loading}
          />
        </PageState>

        {products.length > 0 && (
          <div className="text-center mt-8">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
            >
              Xem thêm sản phẩm
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
