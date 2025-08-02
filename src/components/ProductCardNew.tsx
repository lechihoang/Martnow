import React from 'react';
import Link from "next/link";
import { cn } from "@/lib/utils";
import ProductImage from "./ProductImage";
import ProductInfo from "./ProductInfo";
import AddToCartButton from "./AddToCartButton";
import type { Product } from "../types/entities";

interface ProductCardProps {
  product: Product;
  variant?: "grid" | "list";
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  variant = "grid",
  className 
}) => {
  const isListView = variant === "list";

  if (isListView) {
    return (
      <div className={cn(
        "flex bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow",
        className
      )}>
        {/* Image Section */}
        <div className="w-48 flex-shrink-0">
          <Link href={`/product/${product.id}`}>
            <ProductImage
              src={product.imageUrl}
              alt={product.name}
              isAvailable={product.isAvailable}
              size="medium"
              className="rounded-l-lg"
            />
          </Link>
        </div>

        {/* Content Section */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          <Link href={`/product/${product.id}`}>
            <ProductInfo
              product={product}
              variant="card"
              showDescription={true}
              showCategory={true}
              showStock={true}
              showRating={true}
            />
          </Link>
          
          <div className="mt-4 flex items-center justify-between">
            <AddToCartButton 
              product={product} 
              className="w-auto px-6"
            />
          </div>
        </div>
      </div>
    );
  }

  // Grid View (Default)
  return (
    <div className={cn(
      "bg-white border border-gray-200 rounded-lg group hover:shadow-md transition-shadow",
      className
    )}>
      {/* Image Section */}
      <Link href={`/product/${product.id}`}>
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          isAvailable={product.isAvailable}
          size="medium"
          className="rounded-t-lg"
        />
      </Link>

      {/* Content Section */}
      <div className="p-3 flex flex-col gap-3">
        <Link href={`/product/${product.id}`}>
          <ProductInfo
            product={product}
            variant="card"
            showDescription={false}
            showCategory={true}
            showStock={true}
            showRating={false}
          />
        </Link>
        
        <AddToCartButton 
          product={product} 
          className="w-full rounded-full"
        />
      </div>
    </div>
  );
};

export default ProductCard;
