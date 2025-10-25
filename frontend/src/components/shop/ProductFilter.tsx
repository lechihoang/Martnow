import React, { useState, useEffect } from 'react';
import { Filter, X, Tag, DollarSign } from 'lucide-react';

interface ProductFilterProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  maxPrice: number;
  onClearFilters: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

const ProductFilter: React.FC<ProductFilterProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceRangeChange,
  maxPrice,
  onClearFilters,
  isOpen,
  onToggle
}) => {
  const [localPriceRange, setLocalPriceRange] = useState<[number, number]>(priceRange);

  useEffect(() => {
    setLocalPriceRange(priceRange);
  }, [priceRange]);

  const handlePriceChange = (type: 'min' | 'max', value: number) => {
    const newRange: [number, number] = type === 'min' 
      ? [value, localPriceRange[1]] 
      : [localPriceRange[0], value];
    
    setLocalPriceRange(newRange);
  };

  const handlePriceRangeCommit = () => {
    onPriceRangeChange(localPriceRange);
  };

  // Calculate percentage for range slider background
  const getSliderBackground = () => {
    const minPercent = (localPriceRange[0] / maxPrice) * 100;
    const maxPercent = (localPriceRange[1] / maxPrice) * 100;
    return `linear-gradient(to right, #e5e7eb ${minPercent}%, #10b981 ${minPercent}%, #10b981 ${maxPercent}%, #e5e7eb ${maxPercent}%)`;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div className={`
        fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden
        transition-opacity duration-300
        ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      `} onClick={onToggle} />

      {/* Filter Sidebar */}
      <div className={`
        fixed lg:relative left-0 top-16 lg:top-0 bottom-0 z-30 w-64 bg-white shadow-xl lg:shadow-none
        transform transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-emerald-600" />
              <h3 className="font-semibold text-gray-900">Bộ lọc</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onClearFilters}
                className="text-xs px-2 py-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
              >
                Xóa
              </button>
              <button
                onClick={onToggle}
                className="lg:hidden p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
        </div>

        {/* Filter Content - Scrollable */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="p-4 space-y-6">
            {/* Category Filter */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-gray-500" />
                <h4 className="font-medium text-gray-900">Danh mục</h4>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    value="all"
                    checked={selectedCategory === 'all'}
                    onChange={(e) => onCategoryChange(e.target.value)}
                    className="w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-700">Tất cả danh mục</span>
                </label>
                {categories.map((category) => (
                  <label key={category} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      value={category}
                      checked={selectedCategory === category}
                      onChange={(e) => onCategoryChange(e.target.value)}
                      className="w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                    />
                    <span className="text-sm text-gray-700">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <h4 className="font-medium text-gray-900">Khoảng giá</h4>
              </div>
              
              {/* Price Range Slider */}
              <div className="space-y-4">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{formatPrice(0)}</span>
                  <span>{formatPrice(maxPrice)}</span>
                </div>
                
                <div className="range-slider" style={{ background: getSliderBackground() }}>
                  <input
                    type="range"
                    min="0"
                    max={maxPrice}
                    value={localPriceRange[0]}
                    onChange={(e) => handlePriceChange('min', parseInt(e.target.value))}
                    onMouseUp={handlePriceRangeCommit}
                    onTouchEnd={handlePriceRangeCommit}
                  />
                  <input
                    type="range"
                    min="0"
                    max={maxPrice}
                    value={localPriceRange[1]}
                    onChange={(e) => handlePriceChange('max', parseInt(e.target.value))}
                    onMouseUp={handlePriceRangeCommit}
                    onTouchEnd={handlePriceRangeCommit}
                  />
                </div>

                {/* Price Inputs */}
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Từ</label>
                    <input
                      type="number"
                      min="0"
                      max={maxPrice}
                      value={localPriceRange[0]}
                      onChange={(e) => handlePriceChange('min', parseInt(e.target.value) || 0)}
                      onBlur={handlePriceRangeCommit}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Đến</label>
                    <input
                      type="number"
                      min="0"
                      max={maxPrice}
                      value={localPriceRange[1]}
                      onChange={(e) => handlePriceChange('max', parseInt(e.target.value) || 0)}
                      onBlur={handlePriceRangeCommit}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductFilter;
