import React from 'react';
import { cn } from "@/lib/utils";
import ProductImage from "./ProductImage";
import ProductInfo from "./ProductInfo";
import AddToCartButton from "./AddToCartButton";
import ProductReviewSection from "./ProductReviewSection";
import FavoriteButton from "./FavoriteButton";
import type { Product } from "../types/entities";
import { UserProfile } from '@/types/auth';
import { useAuth } from '@/hooks/useAuth';

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

            {/* Favorite Button Overlay */}
            <div className="absolute top-3 right-3 z-10">
              <FavoriteButton
                product={product}
                user={user}
                userProfile={userProfile}
                loading={false}
                variant="icon"
                className="shadow-lg hover:shadow-xl"
              />
            </div>
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
            <AddToCartButton
              product={product}
              className="w-full h-12 text-lg font-semibold"
              user={user}
              userProfile={userProfile}
            />
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
