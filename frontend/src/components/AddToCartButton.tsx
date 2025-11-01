"use client";

import type { Product } from "../types/entities";
import type { ProductResponseDto } from "../types/dtos";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { ShoppingBag } from "lucide-react";
import useStore from "@/stores/store";
import { User } from '@supabase/supabase-js';
import toast from 'react-hot-toast';
import { UserProfile } from "@/types/auth";


interface Props {
  product: Product | ProductResponseDto;
  className?: string;
  showSuccessMessage?: boolean;
  user: User | null;
  userProfile: UserProfile | null;
}

const AddToCartButton = ({
  product,
  className,
  showSuccessMessage = true,
  user,
  userProfile
}: Props) => {
  const { addToCart } = useStore();

  const isNotAvailable = !product?.isAvailable;
  const isOutOfStock = product?.stock === 0;
  const cannotAddToCart = isNotAvailable || isOutOfStock;

  const handleAddToCart = async () => {
    if (cannotAddToCart) return;

    // Check if user is logged in
    if (!user) {
      toast.error('Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng');
      return;
    }

    // If user is logged in but userProfile is still loading, wait
    if (user && !userProfile) {
      toast.loading('Đang tải thông tin người dùng...', { duration: 1000 });
      return;
    }

    // Check if user is seller - show error message
    if (userProfile?.role === 'SELLER') {
      toast.error('Seller không thể đặt hàng. Bạn chỉ có thể bán sản phẩm.');
      return;
    }

    // Check if user is buyer
    if (userProfile?.role !== 'BUYER') {
      toast.error('Chỉ có buyer mới có thể mua sản phẩm.');
      return;
    }

    try {
      // Convert to ProductResponseDto format if needed
      const productDto: ProductResponseDto = {
        id: product.id,
        sellerId: product.sellerId,
        category: product.category || 'Uncategorized',
        name: product.name,
        description: product.description,
        price: product.price,
        discountedPrice: product.discountedPrice || product.price,
        imageUrl: product.imageUrl,
        isAvailable: product.isAvailable,
        stock: product.stock,
        discount: product.discount || 0,
        createdAt: product.createdAt || new Date(),
        updatedAt: product.updatedAt || new Date(),
        seller: product.seller ? {
          id: product.seller.id,
          shopName: product.seller.shopName || 'Unknown Shop',
          user: product.seller.user ? {
            name: product.seller.user.name,
            address: product.seller.user.address,
            phone: product.seller.user.phone
          } : {
            name: 'Unknown Seller',
          }
        } : {
          id: product.sellerId,
          shopName: 'Unknown Shop',
          user: {
            name: 'Unknown Seller',
          }
        }
      };

      const result = addToCart(productDto);

      if (result.success) {
        // Show success message
        if (showSuccessMessage) {
          toast.success('✓ Đã thêm vào giỏ hàng!');
        }
      } else {
        // Show error message from validation
        toast.error(result.message || 'Không thể thêm vào giỏ hàng');
      }

    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('✗ Có lỗi xảy ra khi thêm vào giỏ hàng!');
    }
  };

  // Always show the button, but validate role when clicked

  // Determine button text
  const getButtonText = () => {
    if (isNotAvailable) return "Ngưng bán";
    if (isOutOfStock) return "Hết hàng";
    return "Mua ngay";
  };

  return (
    <Button
      onClick={handleAddToCart}
      disabled={cannotAddToCart}
      className={cn(
        "w-full btn-primary text-sm py-2 px-3 flex items-center justify-center gap-1 rounded-full",
        cannotAddToCart && "bg-gray-400 hover:bg-gray-400 cursor-not-allowed",
        className
      )}
    >
      <ShoppingBag className="w-4 h-4" />
      {getButtonText()}
    </Button>
  );
};

export default AddToCartButton;