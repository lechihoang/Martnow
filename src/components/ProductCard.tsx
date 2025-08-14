import React from 'react';
import Link from "next/link";
import Image from "next/image";
import PriceView from "./PriceView";
import Title from "./Title";
import type { ProductResponseDto } from "../types/dtos";
import AddToCartButton from "./AddToCartButton";
import FavoriteButton from "./FavoriteButton";

interface ProductCardProps {
  product: ProductResponseDto;
  isFavorite?: boolean;
  onFavoriteChange?: (productId: number, isFavorite: boolean) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, isFavorite, onFavoriteChange }) => {
  // Debug log for image URL
  console.log('ProductCard - Product ID:', product.id, 'ImageURL:', product.imageUrl);
  
  return (
    <div className="text-sm border-[1px] rounded-md border-darkBlue/20 group bg-white">
      <div className="relative group overflow-hidden bg-shop_light_bg">
        {/* Favorite Button */}
        <div className="absolute top-2 right-2 z-10">
          <FavoriteButton 
            productId={product.id} 
            initialIsFavorite={isFavorite}
            onFavoriteChange={onFavoriteChange}
            className="bg-white/80 backdrop-blur-sm" 
          />
        </div>
        <Link href={`/product/${product.id}`}>
        <Image
          src={product.imageUrl || '/default.jpg'}
          alt={product.name}
          width={500}
          height={500}
          priority
          className={`w-full h-64 object-contain overflow-hidden transition-transform bg-shop_light_bg duration-500 
            ${product.isAvailable ? "group-hover:scale-105" : "opacity-50"}`}
        />
      </Link>
      </div>
      <div className="p-3 flex flex-col gap-2">
      <Title className="text-sm line-clamp-1">{product?.name}</Title>
      <div className="flex items-center gap-2.5">
          <p className="font-medium">Số lượng</p>
          <p
            className={`${product?.stock === 0 ? "text-red-600" : "text-shop_dark_green/80 font-semibold"}`}
          >
            {(product?.stock as number) > 0 ? product?.stock : "Đã hết hàng"}
          </p>
        </div>
      <PriceView
          price={product?.price}
          discount={product?.discount}
          className="text-sm"
        />
        <AddToCartButton product={product} className="w-36 rounded-full" />
        </div>
    </div>
  );
};

export default ProductCard;