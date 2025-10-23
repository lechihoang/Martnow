"use client";

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import useStore from '@/stores/store';
import toast from 'react-hot-toast';
import { CartItem as CartItemType } from '@/stores/store';

interface CartItemProps {
  item: CartItemType;
  formatCurrency: (amount: number) => string;
}

const CartItem: React.FC<CartItemProps> = ({
  item,
  formatCurrency,
}) => {
  const { 
    updateCartQuantity, 
    removeFromCart
  } = useStore();

  // Use the product data from the cart item instead of making API calls
  const currentStock = item.product.stock;

  const handleUpdateQuantity = async (newQuantity: number) => {
    if (newQuantity <= 0) {
      // Xóa item nếu quantity <= 0
      removeFromCart(item.product.id);
      toast.success(`Đã xóa ${item.product.name} khỏi giỏ hàng`);
      return;
    }

    if (newQuantity > currentStock) {
      toast.error(`Chỉ còn ${currentStock} sản phẩm trong kho`);
      return;
    }

    // Update quantity
    updateCartQuantity(item.product.id, newQuantity);
  };

  const handleRemove = async () => {
    removeFromCart(item.product.id);
    toast.success(`Đã xóa ${item.product.name} khỏi giỏ hàng`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border">
      <div className="flex items-center space-x-4">
        {/* Product Image */}
        <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
          {item.product.imageUrl ? (
            <Image
              src={item.product.imageUrl}
              alt={item.product.name}
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <ShoppingBag className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {item.product.name}
          </h3>
          <p className="text-sm text-gray-600">
            Bán bởi: {item.product.seller?.user?.name || item.product.seller?.shopName || 'Unknown Seller'}
          </p>
          <p className="text-lg font-bold text-blue-600">
            {formatCurrency(item.product.discountedPrice || item.product.price)}
          </p>
          <p className="text-sm text-gray-500">
            Còn lại: {currentStock} sản phẩm
          </p>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleUpdateQuantity(item.quantity - 1)}
            disabled={item.quantity <= 1}
            className="w-8 h-8 p-0"
          >
            <Minus className="w-4 h-4" />
          </Button>
          
          <span className="w-12 text-center font-medium">
            {item.quantity}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleUpdateQuantity(item.quantity + 1)}
            disabled={item.quantity >= currentStock}
            className="w-8 h-8 p-0"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Remove Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRemove}
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default CartItem;

