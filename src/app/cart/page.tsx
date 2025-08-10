"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import Container from '@/components/Container';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import useUser from '@/hooks/useUser';
import { UserRole } from '@/types/entities';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import PaymentButton from '@/components/PaymentButton';
import { useState } from 'react';

const CartPage: React.FC = () => {
  const router = useRouter();
  const { user } = useUser();
  const { items, removeFromCart, updateQuantity, clearCart, getTotalPrice, getTotalItems } = useCart();
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const handleCreateOrder = async () => {
    if (items.length === 0) return;

    try {
      setIsCreatingOrder(true);

      // Group items by seller để tạo multiple orders nếu cần
      const ordersBySeller = items.reduce((acc, item) => {
        if (!acc[item.sellerId]) {
          acc[item.sellerId] = [];
        }
        acc[item.sellerId].push(item);
        return acc;
      }, {} as Record<number, typeof items>);

      // Tạo đơn hàng đầu tiên (demo - có thể extend để handle multiple sellers)
      const firstSellerItems = Object.values(ordersBySeller)[0];
      
      const orderData = {
        items: firstSellerItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        })),
        note: 'Đơn hàng từ giỏ hàng'
      };

      console.log('User:', user);
      console.log('User role:', user?.role);
      
      if (!user) {
        throw new Error('Vui lòng đăng nhập để tạo đơn hàng');
      }

      if (user.role !== UserRole.BUYER) {
        throw new Error('Chỉ buyer mới có thể tạo đơn hàng');
      }
      
      const response = await fetch('http://localhost:3001/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
          // Không gửi Authorization header - chỉ dựa vào cookies
        },
        credentials: 'include', // Cookies sẽ được gửi tự động
        body: JSON.stringify(orderData)
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.log('Error response:', errorData);
        throw new Error(errorData.message || 'Không thể tạo đơn hàng');
      }

      const { id: newOrderId } = await response.json();
      setOrderId(newOrderId);
      setShowPayment(true);

    } catch (error) {
      console.error('Order creation error:', error);
      alert('Có lỗi xảy ra khi tạo đơn hàng: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsCreatingOrder(false);
    }
  };

  if (items.length === 0) {
    return (
      <Container>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <ShoppingBag className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Giỏ hàng trống</h2>
            <p className="text-gray-600 mb-6">Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
            <Button
              onClick={() => router.push('/shop')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Tiếp tục mua sắm
            </Button>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="max-w-6xl mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Giỏ hàng ({getTotalItems()} sản phẩm)
          </h1>
          <Button
            onClick={clearCart}
            variant="outline"
            className="text-red-600 border-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Xóa tất cả
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.productId} className="bg-white rounded-lg shadow-md p-6 border">
                <div className="flex items-center space-x-4">
                  {/* Product Image */}
                  <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
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
                      {item.productName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Bán bởi: {item.sellerName}
                    </p>
                    <p className="text-lg font-bold text-blue-600">
                      {formatCurrency(item.price)}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    
                    <span className="w-12 text-center font-medium">
                      {item.quantity}
                    </span>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Item Total */}
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFromCart(item.productId)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Stock Warning */}
                {item.quantity >= item.stock && (
                  <div className="mt-2 text-sm text-amber-600 bg-amber-50 p-2 rounded">
                    ⚠️ Đã đạt số lượng tối đa trong kho ({item.stock} sản phẩm)
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 border sticky top-4">
              <h3 className="text-lg font-semibold mb-4">Tóm tắt đơn hàng</h3>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span>Tạm tính:</span>
                  <span>{formatCurrency(getTotalPrice())}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Phí vận chuyển:</span>
                  <span className="text-green-600">Miễn phí</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Tổng cộng:</span>
                    <span className="text-blue-600">{formatCurrency(getTotalPrice())}</span>
                  </div>
                </div>
              </div>

              {!showPayment ? (
                <Button
                  onClick={handleCreateOrder}
                  disabled={isCreatingOrder || items.length === 0}
                  className="w-full bg-green-600 hover:bg-green-700 mb-3"
                >
                  {isCreatingOrder ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Đang tạo đơn hàng...</span>
                    </div>
                  ) : (
                    'Tạo đơn hàng'
                  )}
                </Button>
              ) : (
                <>
                  <div className="text-center text-green-600 font-medium mb-3">
                    ✓ Đơn hàng #{orderId} đã được tạo thành công!
                  </div>
                  
                  <PaymentButton
                    orderId={orderId!}
                    amount={getTotalPrice()}
                    onPaymentStart={() => {
                      console.log('Payment started');
                    }}
                    onPaymentError={(error) => {
                      alert('Lỗi thanh toán: ' + error);
                    }}
                    className="w-full mb-3"
                  />
                </>
              )}

              <Button
                onClick={() => router.push('/shop')}
                variant="outline"
                className="w-full"
              >
                Tiếp tục mua sắm
              </Button>

              <div className="mt-4 text-xs text-gray-500 text-center">
                {!showPayment ? (
                  'Nhấn "Tạo đơn hàng" để tạo đơn hàng và thanh toán'
                ) : (
                  'Nhấn "Thanh toán" để chuyển đến VNPay'
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default CartPage;
