"use client";

import type { Product } from "../types/entities";
import type { ProductResponseDto } from "../types/dtos";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { ShoppingBag } from "lucide-react";
import { useState, useEffect } from "react";
import useStore from "@/stores/store";
import { User } from '@supabase/supabase-js';
import toast from 'react-hot-toast';


interface Props {
  product: Product | ProductResponseDto;
  className?: string;
  showSuccessMessage?: boolean;
  user: User | null;
  userProfile: any;
}

const AddToCartButton = ({
  product,
  className,
  showSuccessMessage = true,
  user,
  userProfile
}: Props) => {
  const { addToCart } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  
  const isOutOfStock = product?.stock === 0 || !product?.isAvailable;

  const handleAddToCart = async () => {
    if (isAdding || isOutOfStock) return;

    // Check if user is logged in
    if (!user) {
      toast.error('Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng');
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

    setIsAdding(true);
    
    try {
      // Convert to ProductResponseDto format if needed
      const productDto: ProductResponseDto = {
        id: product.id,
        sellerId: typeof product.sellerId === 'string' ? parseInt(product.sellerId) : product.sellerId,
        categoryId: product.categoryId,
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
          id: typeof product.seller.id === 'string' ? parseInt(product.seller.id) : product.seller.id,
          shopName: product.seller.shopName || 'Unknown Shop',
          shopAddress: product.seller.shopAddress || '',
          user: product.seller.user || {
            name: 'Unknown Seller',
            username: 'unknown'
          }
        } : {
          id: typeof product.sellerId === 'string' ? parseInt(product.sellerId) : product.sellerId,
          shopName: 'Unknown Shop',
          shopAddress: '',
          user: {
            name: 'Unknown Seller',
            username: 'unknown'
          }
        },
        category: product.category || {
          id: product.categoryId,
          name: 'Unknown Category',
          description: ''
        }
      };

      addToCart(productDto);

      // Show success message
      if (showSuccessMessage) {
        toast.success('✓ Đã thêm vào giỏ hàng!');
      }

    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('✗ Có lỗi xảy ra khi thêm vào giỏ hàng!');
    } finally {
      setIsAdding(false);
    }
  };

  // Always show the button, but validate role when clicked

  return (
    <Button
      onClick={handleAddToCart}
      disabled={isOutOfStock || isAdding}
      className={cn(
        "w-full btn-primary text-sm py-2 px-3 flex items-center justify-center gap-1 rounded-full",
        isOutOfStock && "bg-gray-400 hover:bg-gray-400 cursor-not-allowed",
        className
      )}
    >
      <ShoppingBag className="w-4 h-4" />
      {isAdding ? "Đang thêm..." : isOutOfStock ? "Hết hàng" : "Mua ngay"}
    </Button>
  );
};

export default AddToCartButton;