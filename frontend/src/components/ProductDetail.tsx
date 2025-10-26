import React from 'react';
import Image from 'next/image';
import { cn } from "@/lib/utils";
import ProductInfo from "./ProductInfo";
import AddToCartButton from "./AddToCartButton";
import ProductReviewSection from "./ProductReviewSection";
import FavoriteButton from "./FavoriteButton";
import { Button } from "./ui/button";
import type { Product } from "../types/entities";
import type { ProductResponseDto } from "../types/dtos";
import { UserProfile } from '@/types/auth';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface ProductDetailProps {
  product: Product;
  className?: string;
  userProfile?: UserProfile | null;
}

const ProductDetail: React.FC<ProductDetailProps> = ({
  product,
  className,
  userProfile
}) => {
  const { user } = useAuth();
  const router = useRouter();

  // Convert Product to ProductResponseDto format for FavoriteButton
  const convertToProductDto = (product: Product): ProductResponseDto => {
    return {
      id: product.id,
      sellerId: product.sellerId,
      categoryId: product.categoryId,
      name: product.name,
      description: product.description,
      price: product.price,
      discountedPrice: product.discountedPrice || product.price,
      imageUrl: product.imageUrl,
      isAvailable: product.isAvailable,
      stock: product.stock,
      discount: product.discount,
      createdAt: product.createdAt || new Date(),
      updatedAt: product.updatedAt || new Date(),
      seller: {
        id: product.seller.id,
        shopName: product.seller?.shopName,
        user: {
          name: product.seller?.user?.name || '',
          username: product.seller?.user?.username || '',
          address: product.seller?.user?.address,
          phone: product.seller?.user?.phone,
        },
      },
      category: {
        id: product.categoryId,
        name: product.category?.name || '',
        description: product.category?.description,
      },
      averageRating: product.averageRating,
      totalReviews: product.totalReviews,
      totalSold: product.totalSold,
    };
  };

  const productDto = convertToProductDto(product);

  return (
    <div className={cn(
      "bg-white rounded-lg shadow-sm border border-gray-200",
      className
    )}>
      <div className="grid grid-cols-1 lg:grid-cols-[45%_55%] gap-6 p-6">
        {/* Image Section */}
        <div className="w-full">
          <div className="relative w-full aspect-square bg-gray-50 rounded-lg overflow-hidden">
            <Image
              src={product.imageUrl || '/default.jpg'}
              alt={product.name}
              width={500}
              height={500}
              priority
              className={cn(
                "w-full h-full object-contain transition-transform duration-500",
                product.isAvailable
                  ? "group-hover:scale-105"
                  : "opacity-50 grayscale"
              )}
            />

            {/* Discount Badge - Top Left */}
            {product.discount > 0 && (
              <div className="absolute top-3 left-3 z-10">
                <span className="bg-orange-700 text-white text-sm font-medium px-3 py-1.5 rounded-full shadow-lg">
                  -{product.discount}%
                </span>
              </div>
            )}

            {/* Favorite Button Overlay - Only for buyers */}
            {userProfile?.role === 'BUYER' && (
              <div className="absolute top-3 right-3 z-10">
                <FavoriteButton
                  product={productDto}
                  user={user}
                  userProfile={userProfile}
                  loading={false}
                  variant="icon"
                  className="shadow-lg hover:shadow-xl"
                />
              </div>
            )}
          </div>
        </div>

        {/* Product Info Section */}
        <div className="flex flex-col space-y-6">
          <ProductInfo product={product} />

          {/* Action Buttons */}
          <div className="space-y-3 mt-auto">
            {/* Show button for everyone, but with different states */}
            {!product.isAvailable ? (
              <Button
                disabled
                className="w-full h-12 text-lg font-semibold bg-gray-400 hover:bg-gray-400 cursor-not-allowed"
              >
                Ngừng bán
              </Button>
            ) : product.stock === 0 ? (
              <Button
                disabled
                className="w-full h-12 text-lg font-semibold bg-red-500 hover:bg-red-500 cursor-not-allowed"
              >
                Hết hàng
              </Button>
            ) : userProfile?.role === 'BUYER' ? (
              <AddToCartButton
                product={product}
                className="w-full h-12 text-lg font-semibold"
                user={user}
                userProfile={userProfile}
              />
            ) : (
              <Button
                onClick={() => {
                  if (!user) {
                    router.push('/auth/login');
                  } else {
                    toast.error('Chỉ người mua mới có thể thêm sản phẩm vào giỏ hàng');
                  }
                }}
                className="w-full h-12 text-lg font-semibold bg-emerald-600 hover:bg-emerald-700"
              >
                Mua ngay
              </Button>
            )}
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

      {/* Product Reviews Section */}
      <div className="border-t border-gray-200 p-6">
        <ProductReviewSection productId={product.id} userProfile={userProfile || null} />
      </div>
    </div>
  );
};

export default ProductDetail;
