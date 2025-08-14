'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Heart, X, ShoppingBag, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFavorites } from '@/hooks/useFavorites';
import { favoritesApi } from '@/lib/api';
import PriceView from './PriceView';

interface FavoritesDropdownProps {
  className?: string;
}

const FavoritesDropdown: React.FC<FavoritesDropdownProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { favorites, loading, getFavoritesCount, removeFavorite } = useFavorites();
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRemoveFavorite = async (e: React.MouseEvent, productId: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await favoritesApi.removeFromFavorites(productId);
      removeFavorite(productId);
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const handleProductClick = (productId: number) => {
    setIsOpen(false);
    router.push(`/product/${productId}`);
  };

  const favoritesCount = getFavoritesCount();

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Heart Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-red-500 transition-colors"
        title="Sản phẩm yêu thích"
      >
        <Heart className={`w-6 h-6 ${favoritesCount > 0 ? 'text-red-500' : ''}`} />
        {favoritesCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {favoritesCount > 99 ? '99+' : favoritesCount}
          </span>
        )}
      </button>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              <span className="font-semibold text-gray-900">
                Sản phẩm yêu thích ({favoritesCount})
              </span>
            </div>
            <Link 
              href="/favorites"
              className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
              onClick={() => setIsOpen(false)}
            >
              Xem tất cả
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          {/* Content */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
              </div>
            ) : favoritesCount === 0 ? (
              <div className="text-center py-8 px-4">
                <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm mb-3">
                  Chưa có sản phẩm yêu thích nào
                </p>
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                  onClick={() => setIsOpen(false)}
                >
                  <ShoppingBag className="w-4 h-4" />
                  Khám phá sản phẩm
                </Link>
              </div>
            ) : (
              <div className="py-2">
                {favorites.slice(0, 5).map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-b-0"
                    onClick={() => handleProductClick(product.id)}
                  >
                    {/* Product Image */}
                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={product.imageUrl || '/images/banhmi.jpeg'}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {product.name}
                      </p>
                      <div className="flex items-center gap-2">
                        <PriceView 
                          price={product.price} 
                          discount={product.discount}
                          className="text-sm"
                        />
                        <span className="text-xs text-gray-500">
                          {product.seller?.user?.name || product.seller?.shopName}
                        </span>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={(e) => handleRemoveFavorite(e, product.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      title="Bỏ yêu thích"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                {/* Show more link if there are more than 5 items */}
                {favoritesCount > 5 && (
                  <div className="px-4 py-3 border-t border-gray-100 text-center">
                    <Link
                      href="/favorites"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                      onClick={() => setIsOpen(false)}
                    >
                      Xem thêm {favoritesCount - 5} sản phẩm khác
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FavoritesDropdown;
