'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { productApi } from '@/lib/api';

interface Category {
  id: number;
  name: string;
  description?: string;
  icon?: string;
}

// Default category icons mapping
const categoryIcons: { [key: string]: string } = {
  'Bánh kẹo': '🍰',
  'Đồ dùng vệ sinh': '🧴',
  'Đồ gia dụng': '🔧',
  'Đồ uống': '🥤',
  'Gia vị': '🧂',
  'Lương thực': '🌾',
  'Thực phẩm chế biến': '🍱',
  'default': '📦'
};

const CategoryExplorer: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await productApi.getCategories();
      setCategories(data.slice(0, 8)); // Limit to 8 categories for display
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback categories if API fails
      setCategories([
        { id: 1, name: 'Thực phẩm', description: 'Thực phẩm tươi sống' },
        { id: 2, name: 'Đồ uống', description: 'Nước giải khát' },
        { id: 3, name: 'Gia vị', description: 'Gia vị nấu ăn' },
        { id: 4, name: 'Bánh kẹo', description: 'Bánh kẹo ngọt' },
        { id: 5, name: 'Rau củ', description: 'Rau củ tươi' },
        { id: 6, name: 'Thịt cá', description: 'Thịt cá tươi sống' },
        { id: 7, name: 'Sữa & trứng', description: 'Sản phẩm từ sữa' },
        { id: 8, name: 'Hoa quả', description: 'Trái cây tươi' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (categoryName: string): string => {
    return categoryIcons[categoryName] || categoryIcons['default'];
  };

  if (loading) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Khám phá danh mục</h2>
            <p className="text-gray-600">Tìm kiếm sản phẩm theo danh mục yêu thích</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl p-10 text-center shadow-sm animate-pulse">
                <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <div className="h-10 bg-gray-200 rounded w-3/4 mx-auto flex items-center"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Khám phá danh mục</h2>
          <p className="text-gray-600">Tìm kiếm sản phẩm theo danh mục yêu thích</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/shop?category=${encodeURIComponent(category.name)}`}
              className="group"
            >
              <div className="bg-white rounded-xl p-10 text-center shadow-sm hover:shadow-md transition-all duration-200 group-hover:scale-105">
                <div className="text-5xl mb-6">
                  {getCategoryIcon(category.name)}
                </div>
                <h3 className="font-semibold text-gray-900 text-lg group-hover:text-orange-600 transition-colors h-10 flex items-center justify-center leading-tight">
                  {category.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium transition-colors"
          >
            Xem tất cả danh mục
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CategoryExplorer;