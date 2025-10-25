'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { productApi } from '@/lib/api';
import {
  FaCookie,
  FaSprayCan,
  FaBlender,
  FaCoffee,
  FaPepperHot,
  FaBreadSlice,
  FaHamburger,
  FaShoePrints,
  FaBoxOpen
} from 'react-icons/fa';

interface Category {
  id: number;
  name: string;
  description?: string;
  icon?: string;
}

// Default category icons mapping with Font Awesome icons
const categoryIcons: { [key: string]: React.ComponentType<{ className?: string }> } = {
  'Bánh kẹo': FaCookie,
  'Đồ dùng vệ sinh': FaSprayCan,
  'Đồ gia dụng': FaBlender,
  'Đồ uống': FaCoffee,
  'Gia vị': FaPepperHot,
  'Lương thực': FaBreadSlice,
  'Thực phẩm chế biến': FaHamburger,
  'Giày dép': FaShoePrints,
  'default': FaBoxOpen
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

  const getCategoryIcon = (categoryName: string) => {
    const IconComponent = categoryIcons[categoryName] || categoryIcons['default'];
    return IconComponent;
  };

  if (loading) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Khám phá danh mục</h2>
            <p className="text-gray-600">Tìm kiếm sản phẩm theo danh mục yêu thích</p>
          </div>

          <div className="flex justify-between items-start gap-4 overflow-x-auto py-4 scrollbar-hide">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="flex flex-col items-center flex-1 min-w-[80px] max-w-[120px] animate-pulse">
                <div className="w-16 h-16 bg-gray-200 rounded-full mb-2 flex items-center justify-center"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
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
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Khám phá danh mục</h2>
          <p className="text-gray-600">Tìm kiếm sản phẩm theo danh mục yêu thích</p>
        </div>

        <div className="flex justify-between items-start gap-4 overflow-x-auto py-4 scrollbar-hide">
          {categories.map((category) => {
            const Icon = getCategoryIcon(category.name);
            return (
              <Link
                key={category.id}
                href={`/shop?category=${encodeURIComponent(category.name)}`}
                className="group flex flex-col items-center flex-1 min-w-[80px] max-w-[120px]"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full mb-2 flex items-center justify-center group-hover:from-emerald-500 group-hover:to-emerald-600 transition-all duration-300 group-hover:scale-110 shadow-sm group-hover:shadow-md">
                  <Icon className="w-8 h-8 text-emerald-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-emerald-600 transition-colors text-center w-full">
                  {category.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryExplorer;