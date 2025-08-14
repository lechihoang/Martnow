'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { productApi, favoritesApi } from '@/lib/api';
import { useApiCache } from '@/hooks/useApiCache';
import { useFavorites } from '@/hooks/useFavorites';
import useUser from '@/hooks/useUser';
import ProductGrid from '@/components/ProductGrid';
import { PageState } from '@/components/ui';
import type { ProductResponseDto } from '@/types/dtos';

const ShopPage = () => {
  const { user } = useUser();
  
  // ✅ useFavorites has built-in caching (3min TTL, user-specific)
  const { favorites, addFavorite, removeFavorite, loading: favoritesLoading } = useFavorites();
  
  // ✅ Products cache (5min TTL) 
  const cache = useApiCache<ProductResponseDto[]>({ 
    ttl: 5 * 60 * 1000, // 5 minutes cache
    maxSize: 10 
  });
  
  const [products, setProducts] = useState<ProductResponseDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // ✅ Combined loading state for both cached data sources
  const loading = cache.loading || (user?.buyer && favoritesLoading);

  // Create favorite status map with useMemo for performance
  const favoriteStatus = useMemo(() => {
    return favorites.reduce((acc, product) => {
      acc[product.id] = true;
      return acc;
    }, {} as Record<number, boolean>);
  }, [favorites]);

  const fetchProducts = useCallback(async () => {
    try {
      setError(null);
      const productData = await cache.fetchWithCache(
        'products-list',
        () => productApi.getProducts()
      );
      setProducts(productData);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Không thể tải danh sách sản phẩm');
      setProducts([]);
    }
  }, [cache]);

  const handleFavoriteChange = useCallback(async (productId: number, isFavorite: boolean) => {
    try {
      if (isFavorite) {
        await favoritesApi.addToFavorites(productId);
        await addFavorite(productId); // Update local state with cache invalidation
      } else {
        await favoritesApi.removeFromFavorites(productId);
        removeFavorite(productId); // Update local state with cache invalidation
      }
    } catch (err) {
      console.error('Error updating favorite:', err);
    }
  }, [addFavorite, removeFavorite]);

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Cửa hàng</h1>
        <p className="text-gray-600">Khám phá các món ăn ngon từ nhiều người bán khác nhau</p>
      </div>
      
      <PageState
        loading={loading}
        error={error}
        empty={products.length === 0 && !loading && !error}
        emptyMessage="Chưa có sản phẩm nào. Hãy quay lại sau!"
        onRetry={fetchProducts}
        loadingMessage={cache.loading ? "Đang tải sản phẩm..." : "Đang tải danh sách yêu thích..."}
        emptyIcon={
          <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} 
                  d="M16 11V7a4 4 0 00-8 0v4M8 11v6a2 2 0 002 2h4a2 2 0 002-2v-6M8 11h8" />
          </svg>
        }
      >
        <ProductGrid 
          products={products}
          favoriteStatus={favoriteStatus}
          onFavoriteChange={handleFavoriteChange}
        />
      </PageState>
    </div>
  );
};

export default ShopPage;
