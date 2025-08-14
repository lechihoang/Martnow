import { useState, useEffect, useCallback, useMemo } from 'react';

interface UseDebounceOptions {
  delay?: number;
}

export const useDebounce = <T>(value: T, options: UseDebounceOptions = {}) => {
  const { delay = 500 } = options;
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

interface UseIntersectionObserverOptions {
  threshold?: number;
  rootMargin?: string;
}

export const useIntersectionObserver = (
  options: UseIntersectionObserverOptions = {}
) => {
  const { threshold = 0.1, rootMargin = '0px' } = options;
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [targetElement, setTargetElement] = useState<Element | null>(null);

  const observer = useMemo(() => {
    if (typeof window === 'undefined') return null;
    
    return new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      { threshold, rootMargin }
    );
  }, [threshold, rootMargin]);

  useEffect(() => {
    if (!observer || !targetElement) return;

    observer.observe(targetElement);

    return () => {
      if (targetElement) {
        observer.unobserve(targetElement);
      }
    };
  }, [observer, targetElement]);

  const setTarget = useCallback((element: Element | null) => {
    setTargetElement(element);
  }, []);

  return { isIntersecting, setTarget };
};

interface UsePaginationOptions {
  initialPage?: number;
  pageSize?: number;
}

export const usePagination = <T>(
  items: T[],
  options: UsePaginationOptions = {}
) => {
  const { initialPage = 1, pageSize = 20 } = options;
  const [currentPage, setCurrentPage] = useState(initialPage);

  const totalPages = Math.ceil(items.length / pageSize);
  
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return items.slice(startIndex, endIndex);
  }, [items, currentPage, pageSize]);

  const goToPage = useCallback((page: number) => {
    const targetPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(targetPage);
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, totalPages]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage]);

  const reset = useCallback(() => {
    setCurrentPage(initialPage);
  }, [initialPage]);

  return {
    currentPage,
    totalPages,
    paginatedItems,
    goToPage,
    nextPage,
    prevPage,
    reset,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
  };
};

interface UseVirtualScrollOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

export const useVirtualScroll = <T>(
  items: T[],
  options: UseVirtualScrollOptions
) => {
  const { itemHeight, containerHeight, overscan = 5 } = options;
  const [scrollTop, setScrollTop] = useState(0);

  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const totalHeight = items.length * itemHeight;
  
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    startIndex + visibleCount + 2 * overscan
  );

  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index,
    }));
  }, [items, startIndex, endIndex]);

  const offsetY = startIndex * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
  };
};

interface UseOptimizedSearchOptions<T> {
  searchFields: (keyof T)[];
  debounceDelay?: number;
  caseSensitive?: boolean;
}

export const useOptimizedSearch = <T extends Record<string, any>>(
  items: T[],
  options: UseOptimizedSearchOptions<T>
) => {
  const { searchFields, debounceDelay = 300, caseSensitive = false } = options;
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, { delay: debounceDelay });

  const filteredItems = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return items;

    const term = caseSensitive ? debouncedSearchTerm : debouncedSearchTerm.toLowerCase();

    return items.filter(item =>
      searchFields.some(field => {
        const value = item[field];
        if (typeof value === 'string') {
          const searchValue = caseSensitive ? value : value.toLowerCase();
          return searchValue.includes(term);
        }
        return false;
      })
    );
  }, [items, debouncedSearchTerm, searchFields, caseSensitive]);

  return {
    searchTerm,
    setSearchTerm,
    filteredItems,
    isSearching: searchTerm !== debouncedSearchTerm,
  };
};

// Hook tổng hợp để tối ưu page performance
export const usePageOptimization = () => {
  const [isVisible, setIsVisible] = useState(true);

  // Page visibility API để tạm dừng expensive operations khi tab không visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Performance observer để monitor metrics
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'navigation') {
          console.log('Page load time:', entry.duration);
        }
      });
    });

    observer.observe({ type: 'navigation', buffered: true });

    return () => observer.disconnect();
  }, []);

  return {
    isVisible,
  };
};
