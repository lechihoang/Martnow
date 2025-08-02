import React from 'react';
import { cn } from "@/lib/utils";
import ProductCardNew from "./ProductCardNew";
import NoProductAvailable from "./NoProductAvailable";
import type { Product } from "../types/entities";

interface ProductGridProps {
  products: Product[];
  variant?: "grid" | "list";
  columns?: 2 | 3 | 4 | 5;
  loading?: boolean;
  className?: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({ 
  products, 
  variant = "grid",
  columns = 4,
  loading = false,
  className 
}) => {
  // Loading skeleton
  if (loading) {
    const skeletonItems = Array.from({ length: 8 }, (_, index) => (
      <div key={index} className="bg-white border border-gray-200 rounded-lg animate-pulse">
        <div className="h-64 bg-gray-200 rounded-t-lg"></div>
        <div className="p-3 space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    ));

    return (
      <div className={cn(
        "grid gap-4",
        variant === "grid" && {
          "grid-cols-2 md:grid-cols-3 lg:grid-cols-4": columns === 4,
          "grid-cols-2 md:grid-cols-3 lg:grid-cols-5": columns === 5,
          "grid-cols-1 md:grid-cols-2 lg:grid-cols-3": columns === 3,
          "grid-cols-1 md:grid-cols-2": columns === 2,
        },
        variant === "list" && "grid-cols-1",
        className
      )}>
        {skeletonItems}
      </div>
    );
  }

  // Empty state
  if (!products || products.length === 0) {
    return <NoProductAvailable />;
  }

  // Product grid/list
  return (
    <div className={cn(
      "grid gap-4",
      variant === "grid" && {
        "grid-cols-2 md:grid-cols-3 lg:grid-cols-4": columns === 4,
        "grid-cols-2 md:grid-cols-3 lg:grid-cols-5": columns === 5,
        "grid-cols-1 md:grid-cols-2 lg:grid-cols-3": columns === 3,
        "grid-cols-1 md:grid-cols-2": columns === 2,
      },
      variant === "list" && "grid-cols-1",
      className
    )}>
      {products.map((product) => (
        <ProductCardNew
          key={product.id}
          product={product}
          variant={variant}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
