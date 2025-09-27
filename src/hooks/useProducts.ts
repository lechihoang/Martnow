import { useState, useEffect, useCallback } from 'react';
import { productApi } from '@/lib/api';
import type { ProductResponseDto } from '@/types/dtos';

interface ProductApiResponse {
  products: ProductResponseDto[];
  total: number;
  totalPages: number;
  page: number;
}

interface UseProductsOptions {
  page?: number;
  limit?: number;
  categoryName?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

interface UseProductsReturn {
  products: ProductResponseDto[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  totalProducts: number;
  refetch: () => void;
}

export const useProducts = (options: UseProductsOptions = {}): UseProductsReturn => {
  const {
    page = 1,
    limit = 20, // 20 chia hết cho 2, 4, 5 cột - đảm bảo fill đều các hàng
    categoryName,
    minPrice,
    maxPrice,
    sortBy = 'createdAt',
    sortOrder = 'DESC'
  } = options;

  const [products, setProducts] = useState<ProductResponseDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
      });

      // Handle category filtering
      if (categoryName && categoryName !== 'all') {
        params.append('categoryName', categoryName);
      }

      if (minPrice && minPrice > 0) {
        params.append('minPrice', minPrice.toString());
      }
      
      if (maxPrice && maxPrice < 1000000) {
        params.append('maxPrice', maxPrice.toString());
      }

      const productData = await productApi.getProducts(params.toString()) as any;
      
      if (productData && typeof productData === 'object' && 'products' in productData) {
        setProducts(productData.products);
        setTotalPages(productData.totalPages);
        setTotalProducts(productData.total);
      } else {
        // Fallback for old API format
        setProducts(Array.isArray(productData) ? productData : []);
        setTotalPages(1);
        setTotalProducts(Array.isArray(productData) ? productData.length : 0);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Không thể tải danh sách sản phẩm');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit, categoryName, minPrice, maxPrice, sortBy, sortOrder]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    totalPages,
    totalProducts,
    refetch: fetchProducts
  };
};
