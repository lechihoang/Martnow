'use client';

import { useEffect, useState, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductGrid from '@/components/ProductGrid';
import { PageState, LoadingSpinner } from '@/components/ui';
import { productApi } from '@/lib/api';
import type { ProductResponseDto } from '@/types/dtos';
import { useAuth } from '@/hooks/useAuth';
import { User, UserRole } from '@/types/entities';

const SearchContent = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<User | null>(null);
  
  // Fetch user profile when user changes
  useEffect(() => {
    if (user) {
      // TODO: Implement getUserProfile function or remove this logic
      // For now, we'll set a basic profile from user data
      setUserProfile({
        id: user.id,
        name: user.email || 'User',
        username: user.email?.split('@')[0] || 'user',
        email: user.email || '',
        avatar: user.user_metadata?.avatar_url,
        role: UserRole.BUYER // Default role
      });
    } else {
      setUserProfile(null);
    }
  }, [user]);
  
  const [products, setProducts] = useState<ProductResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchProducts = useCallback(async () => {
    if (!query.trim()) {
      setProducts([]);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Sử dụng productApi từ lib/api.ts với search parameter
      const results = await productApi.getProducts({
        search: query,
        limit: '20'
      });

      // Backend trả về array trực tiếp
      if (Array.isArray(results)) {
        setProducts(results);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    searchProducts();
  }, [searchProducts]);

  return (
    <div className="py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {query ? `Kết quả tìm kiếm cho "${query}"` : 'Tìm kiếm sản phẩm'}
        </h1>
        {!loading && products.length > 0 && (
          <p className="text-gray-600">
            Tìm thấy {products.length} kết quả
          </p>
        )}
      </div>

      <PageState
        loading={loading}
        error={error}
        empty={products.length === 0 && !loading && !error && query.length > 0}
        emptyMessage="Không tìm thấy sản phẩm nào phù hợp với từ khóa của bạn"
        onRetry={searchProducts}
        loadingMessage="Đang tìm kiếm sản phẩm..."
        emptyIcon={
          <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        }
      >
        <ProductGrid
          products={products}
          favoriteStatus={{}}
          user={user}
          userProfile={userProfile}
          loading={loading}
        />
      </PageState>
    </div>
  );
};

const SearchPage = () => {
  return (
    <Suspense fallback={
      <div className="py-8 bg-white">
        <LoadingSpinner size="lg" message="Đang tìm kiếm..." />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
};

export default SearchPage;
