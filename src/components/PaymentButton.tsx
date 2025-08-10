import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

interface PaymentButtonProps {
  orderId: number;
  amount: number;
  onPaymentStart?: () => void;
  onPaymentError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

export function PaymentButton({
  orderId,
  amount,
  onPaymentStart,
  onPaymentError,
  disabled = false,
  className = ""
}: PaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    if (disabled || isLoading) return;

    try {
      setIsLoading(true);
      onPaymentStart?.();

      // Gọi API tạo payment URL
      const response = await fetch(`http://localhost:3001/payment/create/${orderId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Hoặc từ cookie
        },
        credentials: 'include',
        body: JSON.stringify({
          locale: 'vn'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Có lỗi xảy ra khi tạo thanh toán');
      }

      const { paymentUrl } = await response.json();
      
      // Chuyển hướng đến VNPay
      window.location.href = paymentUrl;
      
    } catch (error) {
      console.error('Payment error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra';
      onPaymentError?.(errorMessage);
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={disabled || isLoading}
      className={`bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors ${className}`}
    >
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>Đang xử lý...</span>
        </div>
      ) : (
        `Thanh toán ${formatCurrency(amount)}`
      )}
    </Button>
  );
}

export default PaymentButton;
