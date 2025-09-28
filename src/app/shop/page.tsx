'use client';

import React, { useState, useMemo, useCallback, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import useStore from '@/stores/store';
import { useProducts } from '@/hooks/useProducts';
import { useAuth } from '@/hooks/useAuth';
import ProductGrid from '@/components/ProductGrid';
import { PageState } from '@/components/ui';
import { Filter } from 'lucide-react';
import { productApi, getUserProfile } from '@/lib/api';

// Shop Components
import ProductFilter from '@/components/shop/ProductFilter';
import ShopPagination from '@/components/shop/ShopPagination';

const ShopContent = () => {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [userProfile, setUserProfile] = useState<any>(null);

  // ✅ Sử dụng unified store
  const {isFavorite } = useStore();

  // Get category from URL params
  const categoryFromUrl = searchParams.get('category');

  // Fetch user profile when user changes
  useEffect(() => {
    if (user && user.aud === 'authenticated') {
      getUserProfile().then(profile => {
        if (profile && profile.id) {
          setUserProfile(profile);
        } else {
          setUserProfile(null);
        }
      }).catch(error => {
        console.error('Error fetching user profile:', error);
        setUserProfile(null);
      });
    } else {
      setUserProfile(null);
    }
  }, [user]);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryFromUrl || 'all');
  const [currentPage, setCurrentPage] = useState(1);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [maxPrice, setMaxPrice] = useState(1000000);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Update selected category when URL params change
  useEffect(() => {
    if (categoryFromUrl && categoryFromUrl !== selectedCategory) {
      setSelectedCategory(categoryFromUrl);
      setCurrentPage(1); // Reset to first page when category changes
    }
  }, [categoryFromUrl, selectedCategory]);
  
  // Use the new useProducts hook
  const {
    products,
    loading: productsLoading,
    error,
    totalPages,
    refetch
  } = useProducts({
    page: currentPage,
    limit: 20, // 20 chia hết cho 2, 4, 5 cột - đảm bảo fill đều các hàng
    categoryName: selectedCategory,
    minPrice: priceRange[0],
    maxPrice: priceRange[1],
    sortBy: 'createdAt',
    sortOrder: 'DESC'
  });
  
  // ✅ Combined loading state
  const loading = productsLoading;

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
        setCategories(categoriesData.map((cat: any) => cat.name));
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Fallback to product categories
        const uniqueCategories = new Set(products.map(p => p.category?.name).filter(Boolean));
        setCategories(Array.from(uniqueCategories));
      }
    };
    
    fetchCategories();
  }, [products]);

  // Calculate max price from products
  useMemo(() => {
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
            <Filter className="w-4 h-4 text-orange-600" />
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
                error={error}
                empty={products.length === 0 && !loading && !error}
                emptyMessage="Không tìm thấy sản phẩm phù hợp. Hãy thử thay đổi bộ lọc!"
                onRetry={refetch}
                loadingMessage={productsLoading ? "Đang tải sản phẩm..." : "Đang tải danh sách yêu thích..."}
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
            error={error}
            empty={products.length === 0 && !loading && !error}
            emptyMessage="Không tìm thấy sản phẩm phù hợp. Hãy thử thay đổi bộ lọc!"
            onRetry={refetch}
            loadingMessage={productsLoading ? "Đang tải sản phẩm..." : "Đang tải danh sách yêu thích..."}
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
};

export default ShopPage;
