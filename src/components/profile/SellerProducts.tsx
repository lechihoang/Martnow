"use client";
import React from 'react';
import ProfileCard from './ProfileCard';
import { Product } from '@/types/entities';

interface SellerProductsProps {
  products: Product[];
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: number) => void;
}

const SellerProducts: React.FC<SellerProductsProps> = ({ 
  products, 
  onEditProduct, 
  onDeleteProduct 
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (products.length === 0) {
    return (
      <ProfileCard title="Sản phẩm của tôi">
        <div className="text-center py-8">
          <div className="text-gray-400 text-6xl mb-4">🛒</div>
          <p className="text-gray-500 mb-4">Bạn chưa có sản phẩm nào</p>
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
            Thêm sản phẩm đầu tiên
          </button>
        </div>
      </ProfileCard>
    );
  }

  return (
    <ProfileCard title={`Sản phẩm của tôi (${products.length})`}>
      <div className="mb-4">
        <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
          Thêm sản phẩm mới
        </button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <div key={product.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
            <img
              src={product.imageUrl || '/images/banhmi.jpeg'}
              alt={product.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-gray-900 line-clamp-2">{product.name}</h4>
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                  product.isAvailable 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {product.isAvailable ? 'Đang bán' : 'Tạm ngưng'}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                {product.description}
              </p>
              
              <div className="space-y-1 mb-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Giá:</span>
                  <span className="font-semibold text-green-600">
                    {formatPrice(product.price)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tồn kho:</span>
                  <span className="font-medium">{product.stock}</span>
                </div>
                {product.discount && product.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Giảm giá:</span>
                    <span className="font-medium text-red-600">{product.discount}%</span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => onEditProduct(product)}
                  className="flex-1 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Sửa
                </button>
                <button
                  onClick={() => onDeleteProduct(product.id)}
                  className="flex-1 px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ProfileCard>
  );
};

export default SellerProducts;
