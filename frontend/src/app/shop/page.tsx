'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import useStore from '@/stores/store';
import { useAuthContext } from '@/contexts/AuthContext';
import ProductGrid from '@/components/ProductGrid';
import { PageState, LoadingSpinner } from '@/components/ui';
import { Filter } from 'lucide-react';
import { productApi, getUserProfile } from '@/lib/api';
import type { ProductResponseDto } from '@/types/dtos';
import toast from 'react-hot-toast';
import { User } from '@/types/entities';
import { CATEGORIES } from '@/constants/categories';
import ProductFilter from '@/components/shop/ProductFilter';
import ShopPagination from '@/components/shop/ShopPagination';

const ShopContent = () => {
  const { user } = useAuthContext();
  const searchParams = useSearchParams();
  const { isFavorite } = useStore();

  // States
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [products, setProducts] = useState<ProductResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Filter states
  const categoryFromUrl = searchParams.get('category');
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryFromUrl || 'all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const maxPrice = 1000000; // Fixed max price

  // Update category from URL
  useEffect(() => {
    if (categoryFromUrl && categoryFromUrl !== selectedCategory) {
      setSelectedCategory(categoryFromUrl);
      setCurrentPage(1);
    }
  }, [categoryFromUrl, selectedCategory]);

  // Fetch products
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        // Build query params
        const params: Record<string, string> = {
          page: currentPage.toString(),
          limit: '20',
          sortBy: 'createdAt',
          sortOrder: 'DESC',
        };

        if (selectedCategory !== 'all') {
          params.categoryName = selectedCategory;
        }
        if (priceRange[0] > 0) {
          params.minPrice = priceRange[0].toString();
        }
        if (priceRange[1] < maxPrice) {
          params.maxPrice = priceRange[1].toString();
        }

        // Fetch products
        const productData = await productApi.getProducts(params);

        if (Array.isArray(productData)) {
          setProducts(productData);
          setTotalPages(1);
        } else if (productData && typeof productData === 'object' && 'products' in productData) {
          const paginated = productData as { products: ProductResponseDto[]; totalPages?: number };
          setProducts(paginated.products);
          setTotalPages(paginated.totalPages || 1);
        } else {
          setProducts([]);
          setTotalPages(1);
        }

        // Fetch user profile if authenticated
        if (user?.aud === 'authenticated') {
          try {
            const profile = await getUserProfile();
            setUserProfile(profile || null);
          } catch {
            setUserProfile(null);
          }
        } else {
          setUserProfile(null);
        }
      } catch (err) {
        console.error('Error:', err);
        toast.error('Không thể tải dữ liệu');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, selectedCategory, priceRange, user]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Favorite status map
  const favoriteStatus = useMemo(() => {
    const status: Record<number, boolean> = {};
    products.forEach(product => {
      status[product.id] = isFavorite(product.id);
    });
    return status;
  }, [products, isFavorite]);

  // Handlers
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handlePriceRangeChange = (range: [number, number]) => {
    setPriceRange(range);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSelectedCategory('all');
    setPriceRange([0, maxPrice]);
    setCurrentPage(1);
  };

  const retryFetch = () => {
    setCurrentPage(1);
    setSelectedCategory('all');
    setPriceRange([0, maxPrice]);
  };

  return (
    <div className="min-h-screen py-8">
      {/* Mobile Filter Button & Dropdown */}
      <div className="lg:hidden mb-6">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-quickcart hover:shadow-quickcart-lg transition-all"
        >
          <Filter className="w-4 h-4 text-emerald-600" />
          <span className="text-gray-700">Bộ lọc</span>
          <svg
            className={`w-4 h-4 ml-auto text-gray-500 transition-transform ${isSidebarOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Mobile Filter Content */}
        <div className={`
          overflow-hidden transition-all duration-300 ease-in-out
          ${isSidebarOpen ? 'max-h-[600px] opacity-100 mt-4' : 'max-h-0 opacity-0'}
        `}>
          <div className="bg-white border border-gray-200 rounded-lg shadow-quickcart p-4">
            {/* Category Filter */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <h4 className="font-medium text-gray-900">Danh mục</h4>
                </div>
              </div>
              <div className="space-y-2">
                <label className="flex items-start gap-3 cursor-pointer py-1">
                  <input
                    type="radio"
                    name="category-mobile"
                    value="all"
                    checked={selectedCategory === 'all'}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-700">Tất cả danh mục</span>
                </label>
                {CATEGORIES.map((category) => (
                  <label key={category} className="flex items-start gap-3 cursor-pointer py-1">
                    <input
                      type="radio"
                      name="category-mobile"
                      value={category}
                      checked={selectedCategory === category}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                    />
                    <span className="text-sm text-gray-700">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="space-y-3 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <span className="text-2xl">💰</span>
                <h4 className="font-medium text-gray-900">Khoảng giá</h4>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(0)}</span>
                  <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(maxPrice)}</span>
                </div>

                {/* Range Slider */}
                <div className="relative h-2 bg-gray-200 rounded-full">
                  <div
                    className="absolute h-full bg-emerald-500 rounded-full"
                    style={{
                      left: `${(priceRange[0] / maxPrice) * 100}%`,
                      right: `${100 - (priceRange[1] / maxPrice) * 100}%`
                    }}
                  />
                  <input
                    type="range"
                    min="0"
                    max={maxPrice}
                    step="10000"
                    value={priceRange[0]}
                    onChange={(e) => {
                      const newMin = parseInt(e.target.value);
                      if (newMin < priceRange[1]) {
                        handlePriceRangeChange([newMin, priceRange[1]]);
                      }
                    }}
                    className="absolute w-full h-2 appearance-none bg-transparent pointer-events-auto cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                      [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-600
                      [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md
                      [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full
                      [&::-moz-range-thumb]:bg-emerald-600 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                    style={{ zIndex: priceRange[0] > maxPrice - 100000 ? 5 : 3 }}
                  />
                  <input
                    type="range"
                    min="0"
                    max={maxPrice}
                    step="10000"
                    value={priceRange[1]}
                    onChange={(e) => {
                      const newMax = parseInt(e.target.value);
                      if (newMax > priceRange[0]) {
                        handlePriceRangeChange([priceRange[0], newMax]);
                      }
                    }}
                    className="absolute w-full h-2 appearance-none bg-transparent pointer-events-auto cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                      [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-600
                      [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md
                      [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full
                      [&::-moz-range-thumb]:bg-emerald-600 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                    style={{ zIndex: 4 }}
                  />
                </div>

                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Từ</label>
                    <input
                      type="number"
                      min="0"
                      max={maxPrice}
                      value={priceRange[0]}
                      onChange={(e) => {
                        const newMin = parseInt(e.target.value) || 0;
                        if (newMin < priceRange[1]) {
                          handlePriceRangeChange([newMin, priceRange[1]]);
                        }
                      }}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Đến</label>
                    <input
                      type="number"
                      min="0"
                      max={maxPrice}
                      value={priceRange[1]}
                      onChange={(e) => {
                        const newMax = parseInt(e.target.value) || 0;
                        if (newMax > priceRange[0]) {
                          handlePriceRangeChange([priceRange[0], newMax]);
                        }
                      }}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Clear Filter Button */}
            <button
              onClick={handleClearFilters}
              className="w-full mt-4 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex gap-6">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          <ProductFilter
            categories={[...CATEGORIES]}
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
            empty={!loading && products.length === 0}
            emptyMessage="Không tìm thấy sản phẩm phù hợp"
            onRetry={retryFetch}
            loadingMessage="Đang tải sản phẩm..."
          >
            <ProductGrid
              products={products}
              favoriteStatus={favoriteStatus}
              user={user}
              userProfile={userProfile}
              loading={loading}
            />
            {totalPages > 1 && (
              <ShopPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </PageState>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        <PageState
          loading={loading}
          empty={!loading && products.length === 0}
          emptyMessage="Không tìm thấy sản phẩm phù hợp"
          onRetry={retryFetch}
          loadingMessage="Đang tải sản phẩm..."
        >
          <ProductGrid
            products={products}
            favoriteStatus={favoriteStatus}
            user={user}
            userProfile={userProfile}
            loading={loading}
          />
          {totalPages > 1 && (
            <ShopPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </PageState>
      </div>
    </div>
  );
};

const ShopPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen py-8 bg-white">
        <LoadingSpinner size="lg" message="Đang tải cửa hàng..." />
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
};

export default ShopPage;
