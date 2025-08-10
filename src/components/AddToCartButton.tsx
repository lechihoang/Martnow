"use client";

import type { Product } from "../types/entities";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { ShoppingBag } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/hooks/useCart";

interface Props {
  product: Product;
  className?: string;
  showSuccessMessage?: boolean;
}

const AddToCartButton = ({ product, className, showSuccessMessage = true }: Props) => {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const isOutOfStock = product?.stock === 0 || !product?.isAvailable;

  const handleAddToCart = () => {
    if (isAdding || isOutOfStock) return;
    
    setIsAdding(true);
    
    try {
      // Sử dụng cart context thay vì localStorage trực tiếp
      addToCart({
        productId: product.id,
        productName: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        sellerId: product.sellerId,
        sellerName: product.seller?.user?.name || 'Unknown Seller',
        stock: product.stock
      });

      // Show success message
      if (showSuccessMessage) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      }

    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="w-full h-12 flex items-center relative">
      <Button
        onClick={handleAddToCart}
        disabled={isOutOfStock || isAdding}
        className={cn(
          "w-full bg-shop_dark_green/80 text-lightBg shadow-none border border-shop_dark_green/80 font-semibold tracking-wide text-white hover:bg-shop_dark_green hover:border-shop_dark_green hoverEffect",
          className
        )}
      >
        <ShoppingBag className="mr-2" />
        {isAdding ? "Đang thêm..." : isOutOfStock ? "Hết hàng" : "Thêm vào giỏ"}
      </Button>

      {/* Success Message */}
      {showSuccess && showSuccessMessage && (
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 
                        bg-green-500 text-white text-xs px-3 py-1 rounded-md
                        animate-bounce z-10 whitespace-nowrap">
          ✓ Đã thêm vào giỏ hàng!
        </div>
      )}
    </div>
  );
};

export default AddToCartButton;