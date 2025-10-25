import Title from "./Title";
import ProductCategory from "./ProductCategory";
import ProductStock from "./ProductStock";
import PriceView from "./PriceView";
import type { Product } from "../types/entities";
import Link from "next/link";
import { Store, Star } from "lucide-react";

interface ProductInfoProps {
  product: Product;
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  return (
    <div className="flex flex-col gap-4">
      {/* Category */}
      {product.category && (
        <ProductCategory category={product.category} variant="link" />
      )}

      {/* Title */}
      <Title className="text-2xl font-bold">
        {product.name}
      </Title>

      {/* Rating */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
          <span className="text-lg font-semibold text-gray-900">
            {product.averageRating ? parseFloat(String(product.averageRating)).toFixed(1) : '0.0'}
          </span>
        </div>
        {(product.totalReviews ?? 0) > 0 && (
          <span className="text-sm text-gray-500">
            ({product.totalReviews} đánh giá)
          </span>
        )}
      </div>

      {/* Stock Status */}
      <ProductStock
        stock={product.stock}
        isAvailable={product.isAvailable}
        showLabel={true}
      />

      {/* Price */}
      <PriceView
        price={product.price}
        discount={product.discount}
        className="text-lg"
      />

      {/* Seller Info */}
      {product.sellerId && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Store className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 mb-1">Thông tin người bán</h4>
              <p className="text-sm text-gray-700 font-medium">
                {product.seller?.shopName || product.seller?.user?.name || 'Cửa hàng'}
              </p>
              {product.seller?.user?.address && (
                <p className="text-xs text-gray-500 mt-1 line-clamp-1">{product.seller.user.address}</p>
              )}
              <Link
                href={`/profile/${product.sellerId}`}
                className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 font-medium mt-2 hover:underline"
              >
                Xem trang cá nhân người bán
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductInfo;
