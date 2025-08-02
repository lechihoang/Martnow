import React from 'react';
import { cn } from "@/lib/utils";
import ProductImage from "./ProductImage";
import ProductInfo from "./ProductInfo";
import AddToCartButton from "./AddToCartButton";
import type { Product } from "../types/entities";

interface ProductDetailProps {
  product: Product;
  className?: string;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ 
  product, 
  className 
}) => {
  return (
    <div className={cn(
      "bg-white rounded-lg shadow-sm border border-gray-200",
      className
    )}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
        {/* Image Section */}
        <div className="space-y-4">
          <ProductImage
            src={product.imageUrl}
            alt={product.name}
            isAvailable={product.isAvailable}
            size="large"
            priority={true}
            className="rounded-lg"
          />
          
          {/* Thumbnail Gallery - Placeholder for future */}
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((index) => (
              <div 
                key={index}
                className="aspect-square bg-gray-100 rounded-md border-2 border-transparent hover:border-blue-500 cursor-pointer transition-colors"
              >
                <ProductImage
                  src={product.imageUrl}
                  alt={`${product.name} view ${index}`}
                  isAvailable={product.isAvailable}
                  size="small"
                  className="rounded-md opacity-70 hover:opacity-100"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Product Info Section */}
        <div className="space-y-6">
          <ProductInfo
            product={product}
            variant="detail"
            showDescription={true}
            showCategory={true}
            showStock={true}
            showRating={true}
          />

          {/* Action Buttons */}
          <div className="space-y-3">
            <AddToCartButton 
              product={product} 
              className="w-full h-12 text-lg font-semibold"
            />
            
            <button className="w-full h-12 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
              Thêm vào yêu thích
            </button>
          </div>

          {/* Additional Info */}
          <div className="pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Mã sản phẩm:</span>
                <span className="ml-2 font-medium">SP{product.id.toString().padStart(6, '0')}</span>
              </div>
              <div>
                <span className="text-gray-500">Tình trạng:</span>
                <span className="ml-2 font-medium">
                  {product.isAvailable ? 'Còn hàng' : 'Hết hàng'}
                </span>
              </div>
            </div>
          </div>

          {/* Share & Save */}
          <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-500">Chia sẻ:</span>
            <div className="flex gap-2">
              <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                📘 Facebook
              </button>
              <button className="p-2 text-gray-400 hover:text-blue-400 transition-colors">
                🐦 Twitter
              </button>
              <button className="p-2 text-gray-400 hover:text-pink-500 transition-colors">
                📸 Instagram
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Description Tab */}
      <div className="border-t border-gray-200 p-6">
        <div className="max-w-3xl">
          <h3 className="text-lg font-semibold mb-4">Mô tả chi tiết</h3>
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-600 leading-relaxed">
              {product.description || 'Chưa có mô tả chi tiết cho sản phẩm này.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
