'use client';

import React, { useState, useMemo, useCallback, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import useStore from '@/stores/store';
import { useAuth } from '@/hooks/useAuth';
import ProductGrid from '@/components/ProductGrid';
import { PageState } from '@/components/ui';
import { Filter } from 'lucide-react';
import { productApi, getUserProfile } from '@/lib/api';
import type { ProductResponseDto } from '@/types/dtos';
import toast from 'react-hot-toast';
import { User } from '@/types/entities';

// Shop Components
import ProductFilter from '@/components/shop/ProductFilter';
import ShopPagination from '@/components/shop/ShopPagination';

const ShopContent = () => {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [userProfile, setUserProfile] = useState<User | null>(null);

  // ✅ Sử dụng unified store
  const {isFavorite } = useStore();

  // Get category from URL params
  const categoryFromUrl = searchParams.get('category');


  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryFromUrl || 'all');
  const [currentPage, setCurrentPage] = useState(1);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [maxPrice, setMaxPrice] = useState(1000000);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Product states
  const [products, setProducts] = useState<ProductResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  // Update selected category when URL params change
  useEffect(() => {
    if (categoryFromUrl && categoryFromUrl !== selectedCategory) {
      setSelectedCategory(categoryFromUrl);
      setCurrentPage(1); // Reset to first page when category changes
    }
  }, [categoryFromUrl, selectedCategory]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);
  
  // Fetch products function
  const fetchProducts = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      });

      if (selectedCategory && selectedCategory !== 'all') {
        params.append('categoryName', selectedCategory);
      }

      if (priceRange[0] > 0) {
        params.append('minPrice', priceRange[0].toString());
      }

      if (priceRange[1] < 1000000) {
        params.append('maxPrice', priceRange[1].toString());
      }

      const paramsObject = Object.fromEntries(params.entries());
      const productData = await productApi.getProducts(paramsObject);

      if (Array.isArray(productData)) {
        setProducts(productData);
        setTotalPages(1);
      } else if (productData && typeof productData === 'object' && 'products' in productData) {
        const paginatedData = productData as { products: typeof productData; totalPages: number };
        setProducts(paginatedData.products);
        setTotalPages(paginatedData.totalPages);
      } else {
        setProducts([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      toast.error('Không thể tải danh sách sản phẩm');
      setProducts([]);
    }
  }, [currentPage, selectedCategory, priceRange]);

  // Fetch both products and profile data
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);

      try {
        await Promise.all([
          fetchProducts(),
          // Only fetch profile if user is authenticated
          user && user.aud === 'authenticated' ?
            (async () => {
              try {
                const profile = await getUserProfile();
                setUserProfile(profile || null);
              } catch (error) {
                console.error('Error fetching user profile:', error);
                setUserProfile(null);
              }
            })() :
            Promise.resolve(setUserProfile(null))
        ]);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [fetchProducts, user]);

  // Create favorite status map with useMemo for performance
  const favoriteStatus = useMemo(() => {
    const status: Record<number, boolean> = {};
    products.forEach(product => {
      status[product.id] = isFavorite(product.id);
    });
    return status;
  }, [products, isFavorite]);

  // Get categories from API
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await productApi.getCategories();
        setCategories(categoriesData.map((cat) => cat.name));
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Fallback to product categories only on error
        if (products.length > 0) {
          const uniqueCategories = new Set(products.map(p => p.category?.name).filter(Boolean));
          setCategories(Array.from(uniqueCategories));
        }
      }
    };

    fetchCategories();
  }, []); // Only fetch once on mount

  // Calculate max price from products
  useEffect(() => {
    if (products.length > 0) {
      const maxProductPrice = Math.max(...products.map(p => p.price));
      setMaxPrice(prev => Math.max(prev, maxProductPrice));
    }
  }, [products]);

  const handleClearFilters = useCallback(() => {
    setSelectedCategory('all');
    setPriceRange([0, maxPrice]);
    setCurrentPage(1);
  }, [maxPrice]);

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  }, []);

  const handlePriceRangeChange = useCallback((range: [number, number]) => {
    setPriceRange(range);
    setCurrentPage(1);
  }, []);

  return (
    <div className="min-h-screen py-8">
      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-6">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-quickcart hover:shadow-quickcart-lg transition-all"
        >
          <Filter className="w-4 h-4 text-emerald-600" />
          <span className="text-gray-700">Bộ lọc</span>
        </button>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex gap-6">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <ProductFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
              priceRange={priceRange}
              onPriceRangeChange={handlePriceRangeChange}
              maxPrice={maxPrice}
              onClearFilters={handleClearFilters}
              isOpen={isSidebarOpen}
              onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <PageState
                loading={loading}
                empty={products.length === 0 && !loading}
                emptyMessage="Không tìm thấy sản phẩm phù hợp. Hãy thử thay đổi bộ lọc!"
                onRetry={fetchProducts}
                loadingMessage="Đang tải sản phẩm..."
                emptyIcon={
                  <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                          d="M16 11V7a4 4 0 00-8 0v4M8 11v6a2 2 0 002 2h4a2 2 0 002-2v-6M8 11h6" />
                  </svg>
                }
              >
                <ProductGrid
                  products={products}
                  favoriteStatus={favoriteStatus}
                  user={user}
                  userProfile={userProfile}
                  loading={loading}
                />

                <ShopPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </PageState>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden">
          <PageState
            loading={loading}
            empty={products.length === 0 && !loading}
            emptyMessage="Không tìm thấy sản phẩm phù hợp. Hãy thử thay đổi bộ lọc!"
            onRetry={fetchProducts}
            loadingMessage="Đang tải sản phẩm..."
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
              user={user}
              userProfile={userProfile}
              loading={loading}
            />

            <ShopPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </PageState>
        </div>
      </div>
    
  );
};

const ShopPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
};

export default ShopPage;
