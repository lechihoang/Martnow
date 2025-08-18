import { useState, useEffect, useCallback, useMemo } from 'react';
import { favoritesApi, ApiError } from '@/lib/api';
import { ProductResponseDto } from '@/types/dtos';
import { useApiCache } from './useApiCache';
import useUser from './useUser';

export const useFavorites = () => {
  const { user } = useUser();
  const cache = useApiCache<ProductResponseDto[]>({
    ttl: 3 * 60 * 1000, // 3 minutes - shorter than products since favorites change more often
    maxSize: 5
  });
  
  const [favorites, setFavorites] = useState<ProductResponseDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const loading = cache.loading;

  const fetchFavorites = useCallback(async (forceRefresh = false) => {
    if (!user) {
      setFavorites([]);
      return;
    }
    
    if (!user.buyer && user.role !== 'buyer') {
      setFavorites([]);
      return;
    }

    try {
      setError(null);
      const cacheKey = `favorites-user-${user.id}`;
      const favoriteProducts = await cache.fetchWithCache(
        cacheKey,
        () => favoritesApi.getFavorites(),
        { forceRefresh }
      );
      setFavorites(favoriteProducts);
    } catch (err) {
      console.error('Error fetching favorites:', err);
      
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setError('Bạn cần đăng nhập để xem danh sách yêu thích');
        } else if (err.status === 400 && err.message.includes('buyer')) {
          setError('Chỉ người mua mới có thể sử dụng tính năng yêu thích');
        } else {
          setError(err.message || 'Không thể tải danh sách yêu thích');
        }
      } else {
        setError('Không thể tải danh sách yêu thích');
      }
      
      setFavorites([]);
    }
  }, [user, cache]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const getFavoritesCount = useCallback(() => favorites.length, [favorites]);

  const removeFavorite = useCallback((productId: number) => {
    // Optimistic update
    setFavorites(prev => prev.filter(product => product.id !== productId));
    
    // Invalidate cache to ensure fresh data next time
    if (user) {
      cache.invalidate(`favorites-user-${user.id}`);
    }
  }, [cache, user]);

  const addFavorite = useCallback(async (productId: number) => {
    try {
      // Fetch specific product to add to favorites list (can also be cached)
      const response = await fetch(`http://localhost:3001/products/${productId}`, {
        credentials: 'include',
      });
      if (response.ok) {
        const newProduct = await response.json();
        // Optimistic update
        setFavorites(prev => {
          const exists = prev.find(p => p.id === productId);
          return exists ? prev : [...prev, newProduct];
        });
        
        // Invalidate cache to ensure consistency
        if (user) {
          cache.invalidate(`favorites-user-${user.id}`);
        }
      }
    } catch (err) {
      console.error('Error adding favorite:', err);
      // Fall back to refetch with cache
      await fetchFavorites(true); // Force refresh
    }
  }, [fetchFavorites, cache, user]);

  return useMemo(() => ({
    favorites,
    loading,
    error,
    getFavoritesCount,
    removeFavorite,
    addFavorite,
    refetch: fetchFavorites,
    invalidateCache: () => user && cache.invalidate(`favorites-user-${user.id}`)
  }), [favorites, loading, error, getFavoritesCount, removeFavorite, addFavorite, fetchFavorites, cache, user]);
};
