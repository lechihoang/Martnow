import { cn } from "@/lib/utils";
import Title from "./Title";
import ProductCategory from "./ProductCategory";
import ProductStock from "./ProductStock";
import ProductRating from "./ProductRating";
import PriceView from "./PriceView";
import type { Product } from "../types/entities";

interface ProductInfoProps {
  product: Product;
  variant?: "card" | "detail";
  showDescription?: boolean;
  showCategory?: boolean;
  showStock?: boolean;
  showRating?: boolean;
  className?: string;
}

const ProductInfo = ({ 
  product,
  variant = "card",
  showDescription = false,
  showCategory = true,
  showStock = true,
  showRating = false,
  className 
}: ProductInfoProps) => {
  const isDetailView = variant === "detail";

  return (
    <div className={cn(
      "flex flex-col gap-2",
      isDetailView ? "gap-4" : "gap-2",
      className
    )}>
      {/* Category */}
      {showCategory && product.category && (
        <ProductCategory 
          category={product.category} 
          variant={isDetailView ? "link" : "badge"}
        />
      )}

      {/* Title */}
      <Title className={cn(
        isDetailView ? "text-2xl font-bold" : "text-sm line-clamp-1"
      )}>
        {product.name}
      </Title>

      {/* Description */}
      {showDescription && product.description && (
        <p className={cn(
          "text-gray-600",
          isDetailView ? "text-base leading-relaxed" : "text-sm line-clamp-2"
        )}>
          {product.description}
        </p>
      )}

      {/* Rating */}
      {showRating && (
        <ProductRating 
          rating={0} // TODO: Calculate from reviews
          reviewCount={0} // TODO: Count from reviews
          size={isDetailView ? "medium" : "small"}
        />
      )}

      {/* Stock Status */}
      {showStock && (
        <ProductStock 
          stock={product.stock}
          isAvailable={product.isAvailable}
          showLabel={isDetailView}
        />
      )}

      {/* Price */}
      <PriceView
        price={product.price}
        discount={product.discount}
        className={cn(
          isDetailView ? "text-lg" : "text-sm"
        )}
      />

      {/* Seller Info for detail view */}
      {isDetailView && product.seller && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-1">Thông tin người bán</h4>
          <p className="text-sm text-gray-600">{product.seller.shopName}</p>
          {product.seller.shopAddress && (
            <p className="text-xs text-gray-500 mt-1">{product.seller.shopAddress}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductInfo;
