import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import PaymentButton from '@/components/PaymentButton';

interface OrderSummaryProps {
  cartItems: Array<{
    productId: number;
    productName: string;
    price: number;
    quantity: number;
    sellerId: number;
  }>;
  totalAmount: number;
  onOrderCreated?: (orderId: number) => void;
  onError?: (error: string) => void;
}

export function OrderSummary({
  cartItems,
  totalAmount,
  onOrderCreated,
  onError
}: OrderSummaryProps) {
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [orderStatus, setOrderStatus] = useState<string>('pending');

  const handleCreateOrder = async () => {
    if (cartItems.length === 0) {
      onError?.('Giỏ hàng trống');
      return;
    }

    try {
      setIsCreatingOrder(true);

      // Group items by seller để tạo multiple orders nếu cần
      const ordersByseller = cartItems.reduce((acc, item) => {
        if (!acc[item.sellerId]) {
          acc[item.sellerId] = [];
        }
        acc[item.sellerId].push(item);
        return acc;
      }, {} as Record<number, typeof cartItems>);

      // Tạo đơn hàng đầu tiên (demo - có thể extend để handle multiple sellers)
      const firstSellerItems = Object.values(ordersByseller)[0];
      
      const orderData = {
        items: firstSellerItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        })),
        note: 'Đơn hàng từ website'
      };

      const response = await fetch(`http://localhost:3001/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể tạo đơn hàng');
      }

      const { id: newOrderId } = await response.json();
      setOrderId(newOrderId);
      setShowPayment(true);
      onOrderCreated?.(newOrderId);

    } catch (error) {
      console.error('Order creation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra';
      onError?.(errorMessage);
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Tóm tắt đơn hàng</h3>
      
      {/* Cart Items */}
      <div className="space-y-3 mb-4">
        {cartItems.map((item, index) => (
          <div key={index} className="flex justify-between items-center text-sm">
            <div className="flex-1">
              <p className="font-medium">{item.productName}</p>
              <p className="text-gray-500">SL: {item.quantity}</p>
            </div>
            <p className="font-medium">
              {formatCurrency(item.price * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="border-t pt-3 mb-4">
        <div className="flex justify-between items-center text-lg font-semibold">
          <span>Tổng cộng:</span>
          <span className="text-blue-600">{formatCurrency(totalAmount)}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {!showPayment ? (
          <Button
            onClick={handleCreateOrder}
            disabled={isCreatingOrder || cartItems.length === 0}
            className="w-full bg-green-600 hover:bg-green-700"
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
            <div className="text-center text-green-600 font-medium mb-2">
              ✓ Đơn hàng #{orderId} đã được tạo thành công!
            </div>
            
            <PaymentButton
              orderId={orderId!}
              amount={totalAmount}
              onPaymentStart={() => {
                console.log('Payment started');
              }}
              onPaymentError={(error) => {
                onError?.(error);
              }}
              className="w-full"
            />
            
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                // Navigate to order management hoặc reset form
                window.location.href = '/manage-orders';
              }}
            >
              Xem đơn hàng
            </Button>
          </>
        )}
      </div>

      {/* Info Text */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        {!showPayment ? (
          'Nhấn "Tạo đơn hàng" để tạo đơn hàng và thanh toán'
        ) : (
          'Nhấn "Thanh toán" để chuyển đến VNPay'
        )}
      </div>
    </div>
  );
}

export default OrderSummary;
