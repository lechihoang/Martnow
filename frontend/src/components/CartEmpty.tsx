"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';

interface CartEmptyProps {
  onContinueShopping: () => void;
}

const CartEmpty: React.FC<CartEmptyProps> = ({ onContinueShopping }) => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <ShoppingBag className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Giỏ hàng trống</h2>
        <p className="text-gray-600 mb-6">Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
        <Button
          onClick={onContinueShopping}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Tiếp tục mua sắm
        </Button>
      </div>
    </div>
  );
};

export default CartEmpty;

