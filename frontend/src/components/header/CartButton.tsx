import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import useStore from '@/stores/store';

const CartButton = () => {
  const { getCartUniqueItems } = useStore();
  const router = useRouter();

  return (
    <button
      onClick={() => router.push('/cart')}
      className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors tooltip-trigger"
      aria-label="Giỏ hàng"
      title="Giỏ hàng"
    >
      <ShoppingBag className="w-5 h-5" />
      {getCartUniqueItems() > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
          {getCartUniqueItems() > 99 ? '99+' : getCartUniqueItems()}
        </span>
      )}
    </button>
  );
};

export default CartButton;
