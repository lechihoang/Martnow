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
      <div className="relative overflow-hidden bg-gray-500/10 rounded-lg">
        {/* Stock Badge - Top Left */}
        {product.stock === 0 && (
          <div className="absolute top-3 left-3 z-10">
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
              Hết hàng
            </span>
          </div>
        )}

        {/* Discount Badge - Top Right */}
        {product.discount > 0 && (
          <div className="absolute top-2 right-2 z-10">
            <span className="bg-orange-600 text-white text-xs font-medium px-2 py-1 rounded-full">
              -{product.discount}%
            </span>
          </div>
        )}

        {/* Favorite Button - Top Right (always visible) */}
        <div className="absolute top-2 right-2 z-20">
          <FavoriteButton
            product={product}
            user={user}
            userProfile={userProfile}
            loading={loading}
            className="bg-gray-500/70 backdrop-blur-sm hover:bg-white transition-all duration-200 rounded-full"
          />
        </div>

        {/* Product Image */}
        <Link href={`/product/${product.id}`}>
          <Image
            src={product.imageUrl || '/default.jpg'}
            alt={product.name}
            width={400}
            height={400}
            priority
            className={`w-full h-32 sm:h-36 md:h-40 lg:h-44 xl:h-48 object-contain transition-transform duration-300 p-4
              ${product.isAvailable ? "group-hover:scale-105" : "opacity-50"}`}
          />
        </Link>
      </div>

      {/* Content Container */}
      <div className="p-4 space-y-3 flex flex-col">
        {/* Product Title */}
        <Link href={`/product/${product.id}`}>
          <Title className="text-base font-medium text-gray-900 line-clamp-2 hover:text-orange-600 transition-colors h-12 leading-6">
            {product?.name}
          </Title>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 text-sm">
          {/* 5-star rating display */}
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => {
              const rating = product.averageRating ? parseFloat(String(product.averageRating)) : 0;
              const isFilled = star <= Math.round(rating);
              return (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    isFilled
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              );
            })}
          </div>
          <span className="text-gray-500 ml-1">
            {product.averageRating && parseFloat(String(product.averageRating)) > 0
              ? parseFloat(String(product.averageRating)).toFixed(1)
              : '0.0'
            }
          </span>
        </div>

        {/* Price */}
        <PriceView
          price={product?.price}
          discount={product?.discount}
          discountedPrice={product?.discountedPrice}
          className="text-lg font-semibold"
        />

        {/* Add to Cart Button */}
        <AddToCartButton
          product={product}
          user={user}
          userProfile={userProfile}
        />
      </div>
    </div>
  );
};

export default ProductCard;