"use client";
import React, { useState } from 'react';
import ProductCardNew from '@/components/ProductCardNew';
import ProductDetail from '@/components/ProductDetail';
import ProductGridNew from '@/components/ProductGridNew';
import type { Product } from '@/types/entities';

// Mock data for testing
const mockProduct: Product = {
  id: 1,
  name: "Bánh mì thịt nướng đặc biệt",
  description: "Bánh mì thịt nướng với gia vị đặc biệt, kèm theo rau sống tươi ngon và sốt mayonnaise hảo hạng. Được làm từ bánh mì tươi nướng giòn, thịt nướng thơm lừng ướp gia vị bí truyền.",
  price: 25000,
  imageUrl: "/images/banhmi.jpeg",
  isAvailable: true,
  stock: 15,
  discount: 10,
  category: {
    id: 1,
    name: "Bánh mì",
    description: "Các loại bánh mì",
    products: []
  },
  seller: {
    id: 1,
    shopName: "Bánh mì cô Ba",
    shopAddress: "123 Nguyễn Huệ, Q1, TP.HCM",
    shopPhone: "0901234567",
    description: "Chuyên bánh mì ngon",
    user: {
      id: 1,
      name: "Cô Ba",
      username: "coba",
      email: "coba@example.com",
      role: "seller",
      password: ""
    },
    products: []
  }
};

const mockProducts: Product[] = [
  mockProduct,
  {
    ...mockProduct,
    id: 2,
    name: "Bánh mì pate",
    price: 20000,
    stock: 0,
    isAvailable: false,
    discount: 0
  },
  {
    ...mockProduct,
    id: 3,
    name: "Bánh mì xíu mại",
    price: 30000,
    stock: 3,
    discount: 15
  },
  {
    ...mockProduct,
    id: 4,
    name: "Bánh mì chả cá",
    price: 35000,
    stock: 8,
    discount: 0
  }
];

export default function ProductDemo() {
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'detail'>('grid');

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Demo Product Components</h1>
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-4 py-2 rounded ${
              viewMode === 'grid' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Grid View
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded ${
              viewMode === 'list' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            List View
          </button>
          <button
            onClick={() => setViewMode('detail')}
            className={`px-4 py-2 rounded ${
              viewMode === 'detail' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Detail View
          </button>
        </div>
      </div>

      {viewMode === 'detail' ? (
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Product Detail Component</h2>
          <ProductDetail product={mockProduct} />
        </div>
      ) : (
        <div>
          <h2 className="text-2xl font-bold mb-6">
            Product {viewMode === 'grid' ? 'Grid' : 'List'} Component
          </h2>
          <ProductGridNew 
            products={mockProducts} 
            variant={viewMode}
            columns={4}
          />
        </div>
      )}

      {/* Individual Card Examples */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Individual Product Cards</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Grid Card</h3>
            <ProductCardNew product={mockProduct} variant="grid" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">List Card</h3>
            <ProductCardNew product={mockProduct} variant="list" />
          </div>
        </div>
      </div>

      {/* Loading State Example */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Loading State</h2>
        <ProductGridNew 
          products={[]} 
          variant="grid"
          columns={4}
          loading={true}
        />
      </div>
    </div>
  );
}
