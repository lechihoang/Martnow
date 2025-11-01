'use client';

import React from 'react';
import Link from 'next/link';
import { CATEGORIES, CATEGORY_DESCRIPTIONS } from '@/constants/categories';
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
  // Use categories from constants
  const categories = CATEGORIES.map(name => ({
    name,
    description: CATEGORY_DESCRIPTIONS[name]
  }));

  const getCategoryIcon = (categoryName: string) => {
    const IconComponent = categoryIcons[categoryName] || categoryIcons['default'];
    return IconComponent;
  };

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Khám phá danh mục</h2>
          <p className="text-gray-600">Tìm kiếm sản phẩm theo danh mục yêu thích</p>
        </div>

        <div className="flex justify-between items-start gap-4 overflow-x-auto py-4 scrollbar-hide">
          {categories.map((category, index) => {
            const Icon = getCategoryIcon(category.name);
            return (
              <Link
                key={index}
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