import React from 'react';
import Link from "next/link";
import Image from "next/image";
import PriceView from "./PriceView";
import Title from "./Title";
import type { ProductResponseDto } from "../types/dtos";
import AddToCartButton from "./AddToCartButton";
import FavoriteButton from "./FavoriteButton";
import { Star } from 'lucide-react';
import { UserProfile } from '@/types/auth';
import { User } from '@supabase/supabase-js';

interface ProductCardProps {
  product: ProductResponseDto;
  isFavorite?: boolean;
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  user,
  userProfile,
  loading
}) => {
  return (
    <div className="group relative card-quickcart-product w-full max-w-full">
      {/* Image Container */}
      <div className="relative overflow-hidden bg-white rounded-lg aspect-square">
        {/* Discount Badge - Top Left */}
        {product.discount > 0 && (
          <div className="absolute top-2 left-2 z-10">
            <span className="bg-orange-700 text-white text-xs font-medium px-2 py-1 rounded-full">
              -{product.discount}%
            </span>
          </div>
        )}

        {/* Favorite Button - Top Right (only for buyers) */}
        {userProfile?.role === 'BUYER' && (
          <div className="absolute top-2 right-2 z-20">
            <FavoriteButton
              product={product}
              user={user}
              userProfile={userProfile}
              loading={loading}
              className="bg-gray-500/70 backdrop-blur-sm hover:bg-white transition-all duration-200 rounded-full"
            />
          </div>
        )}

        {/* Product Image */}
        <Link href={`/product/${product.id}`} className="block w-full h-full">
          <Image
            src={product.imageUrl || '/default.jpg'}
            alt={product.name}
            width={400}
            height={400}
            priority
            className={`w-full h-full object-contain transition-transform duration-300
              ${product.isAvailable ? "group-hover:scale-105" : "opacity-50"}`}
          />
        </Link>
      </div>

      {/* Content Container */}
      <div className="p-4 space-y-3 flex flex-col bg-gray-100">
        {/* Product Title */}
        <Link href={`/product/${product.id}`}>
          <Title className="text-base font-medium text-gray-900 line-clamp-2 hover:text-emerald-600 transition-colors h-12 leading-6">
            {product?.name}
          </Title>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 text-sm">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-gray-700 font-medium">
            {product.averageRating && parseFloat(String(product.averageRating)) > 0
              ? parseFloat(String(product.averageRating)).toFixed(1)
              : '0.0'
            }
          </span>
          {product.totalReviews && product.totalReviews > 0 && (
            <span className="text-gray-500 text-xs">
              ({product.totalReviews})
            </span>
          )}
        </div>

        {/* Stock Status */}
        <div className="text-sm">
          {!product.isAvailable ? (
            <span className="text-gray-600 font-medium">Ngừng bán</span>
          ) : product.stock === 0 ? (
            <span className="text-red-600 font-medium">Hết hàng</span>
          ) : (
            <span className="text-emerald-600 font-medium">Còn {product.stock} sản phẩm</span>
          )}
        </div>

        {/* Price */}
        <PriceView
          price={product?.price}
          discount={product?.discount}
          discountedPrice={product?.discountedPrice}
          className="text-lg font-semibold"
        />

        {/* Add to Cart Button - Only show for buyers */}
        {userProfile?.role === 'BUYER' && (
          <AddToCartButton
            product={product}
            user={user}
            userProfile={userProfile}
          />
        )}
      </div>
    </div>
  );
};

export default React.memo(ProductCard, (prevProps, nextProps) => {
  // Only re-render if product data, user, or loading state changes
  return (
    prevProps.product.id === nextProps.product.id &&
    prevProps.product.name === nextProps.product.name &&
    prevProps.product.price === nextProps.product.price &&
    prevProps.product.stock === nextProps.product.stock &&
    prevProps.user?.id === nextProps.user?.id &&
    prevProps.userProfile?.id === nextProps.userProfile?.id &&
    prevProps.loading === nextProps.loading
  );
});