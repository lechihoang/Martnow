import React from 'react';
import { cn } from "@/lib/utils";
import ProductImage from "./ProductImage";
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
        shopAddress: product.seller?.shopAddress,
        user: {
          name: product.seller?.user?.name || '',
          username: product.seller?.user?.username || '',
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

  // Create array of images - expandable for multiple images in future
  const getProductImages = (product: Product): string[] => {
    // TODO: When backend supports multiple images, update this logic
    // For now, just use main image or default
    if (product.imageUrl) {
      return [product.imageUrl];
    }
    return ['/default.jpg']; // Always show at least one image
  };

  const productImages = getProductImages(product);
  const [selectedImageIndex, setSelectedImageIndex] = React.useState(0);

  return (
    <div className={cn(
      "bg-white rounded-lg shadow-sm border border-gray-200",
      className
    )}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
        {/* Image Section */}
        <div className="space-y-4">
          <div className="relative">
            <ProductImage
              src={productImages[selectedImageIndex]}
              alt={product.name}
              isAvailable={product.isAvailable}
              size="large"
              priority={true}
              className="rounded-lg"
            />

            {/* Discount Badge - Top Left */}
            {product.discount > 0 && (
              <div className="absolute top-3 left-3 z-10">
                <span className="bg-orange-600 text-white text-sm font-medium px-3 py-1.5 rounded-full shadow-lg">
                  -{product.discount}%
                </span>
              </div>
            )}

            {/* Stock Badge - Top Left (below discount if both exist) */}
            {product.stock === 0 && (
              <div className={`absolute ${product.discount > 0 ? 'top-14' : 'top-3'} left-3 z-10`}>
                <span className="bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg">
                  Hết hàng
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

          {/* Thumbnail Gallery - Dynamic based on available images */}
          {productImages.length > 1 && (
            <div className={cn(
              "grid gap-2",
              productImages.length === 2 && "grid-cols-2",
              productImages.length === 3 && "grid-cols-3",
              productImages.length >= 4 && "grid-cols-4"
            )}>
              {productImages.map((imageUrl, index) => (
                <div
                  key={index}
                  className={cn(
                    "aspect-square bg-gray-100 rounded-md border-2 cursor-pointer transition-colors",
                    selectedImageIndex === index
                      ? "border-blue-500"
                      : "border-transparent hover:border-blue-500"
                  )}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <ProductImage
                    src={imageUrl}
                    alt={`${product.name} view ${index + 1}`}
                    isAvailable={product.isAvailable}
                    size="small"
                    className="rounded-md"
                  />
                </div>
              ))}
            </div>
          )}
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
            {/* Add to Cart Button - Only for buyers */}
            {userProfile?.role === 'BUYER' && (
              <AddToCartButton
                product={product}
                className="w-full h-12 text-lg font-semibold"
                user={user}
                userProfile={userProfile}
              />
            )}

            {/* Login Button for guests */}
            {!user && (
              <Button
                onClick={() => router.push('/auth/login')}
                className="w-full h-12 text-lg font-semibold btn-primary"
              >
                Đăng nhập để mua hàng
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
