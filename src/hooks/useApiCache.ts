import { useState, useCallback, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

interface ApiCacheConfig {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum cache size
}

export const useApiCache = <T = any>(config: ApiCacheConfig = {}) => {
  const { ttl = 5 * 60 * 1000, maxSize = 100 } = config; // Default 5 minutes TTL
  const cache = useRef<Map<string, CacheEntry<T>>>(new Map());
  const [loading, setLoading] = useState(false);

  const cleanExpiredEntries = useCallback(() => {
    const now = Date.now();
    const entries = Array.from(cache.current.entries());
    
    for (const [key, entry] of entries) {
      if (now > entry.expiry) {
        cache.current.delete(key);
      }
    }
  }, []);

  const evictOldestEntry = useCallback(() => {
    if (cache.current.size === 0) return;
    
    const entries = Array.from(cache.current.entries());
    const oldest = entries.reduce((prev, curr) => 
      curr[1].timestamp < prev[1].timestamp ? curr : prev
    );
    
    cache.current.delete(oldest[0]);
  }, []);

  const get = useCallback((key: string): T | null => {
    cleanExpiredEntries();
    
    const entry = cache.current.get(key);
    if (!entry) return null;
    
    const now = Date.now();
    if (now > entry.expiry) {
      cache.current.delete(key);
      return null;
    }
    
    return entry.data;
  }, [cleanExpiredEntries]);

  const set = useCallback((key: string, data: T) => {
    cleanExpiredEntries();
    
    // Evict oldest entry if cache is full
    if (cache.current.size >= maxSize) {
      evictOldestEntry();
    }
    
    const now = Date.now();
    cache.current.set(key, {
      data,
      timestamp: now,
      expiry: now + ttl,
    });
  }, [ttl, maxSize, cleanExpiredEntries, evictOldestEntry]);

  const fetchWithCache = useCallback(async <R = T>(
    key: string,
    fetcher: () => Promise<R>,
    options: { forceRefresh?: boolean } = {}
  ): Promise<R> => {
    const { forceRefresh = false } = options;
    
    // Return cached data if available and not forcing refresh
    if (!forceRefresh) {
      const cachedData = get(key);
      if (cachedData !== null) {
        return cachedData as R;
      }
    }
    
    setLoading(true);
    try {
      const data = await fetcher();
      set(key, data as T);
      return data;
    } finally {
      setLoading(false);
    }
  }, [get, set]);

  const invalidate = useCallback((key: string) => {
    cache.current.delete(key);
  }, []);

  const invalidateAll = useCallback(() => {
    cache.current.clear();
  }, []);

  const has = useCallback((key: string): boolean => {
    cleanExpiredEntries();
    return cache.current.has(key);
  }, [cleanExpiredEntries]);

  const size = useCallback((): number => {
    cleanExpiredEntries();
    return cache.current.size;
  }, [cleanExpiredEntries]);

  return {
    get,
    set,
    fetchWithCache,
    invalidate,
    invalidateAll,
    has,
    size,
    loading,
  };
};

export default useApiCache;
