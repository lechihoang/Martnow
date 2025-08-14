"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Container from '@/components/Container';
import { Button } from '@/components/ui/button';

interface PaymentResult {
  success: boolean;
  message: string;
  orderId?: number;
  amount?: number;
  transactionId?: string;
}

const PaymentReturnContent: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const processPaymentReturn = async () => {
      try {
        // Lấy tất cả query parameters từ VNPay
        const params = new URLSearchParams();
        searchParams.forEach((value, key) => {
          params.append(key, value);
        });

        // Gọi API xử lý payment return
        const response = await fetch(
          `http://localhost:3001/payment/vnpay-return?${params.toString()}`,
          {
            method: 'GET',
            credentials: 'include'
          }
        );

        const data = await response.json();
        
        if (response.ok) {
          setResult({
            success: true,
            message: data.message || 'Thanh toán thành công!',
            orderId: data.orderId,
            amount: data.amount,
            transactionId: data.transactionId
          });
        } else {
          setResult({
            success: false,
            message: data.message || 'Thanh toán thất bại!'
          });
        }
      } catch (error) {
        console.error('Payment processing error:', error);
        setResult({
          success: false,
          message: 'Có lỗi xảy ra khi xử lý thanh toán'
        });
      } finally {
        setLoading(false);
      }
    };

    processPaymentReturn();
  }, [searchParams]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (loading) {
    return (
      <Container>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Đang xử lý kết quả thanh toán...</p>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <div className="text-center">
            {result?.success ? (
              <>
                {/* Success Icon */}
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <svg
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-green-600 mb-2">
                  Thanh toán thành công!
                </h2>
                <p className="text-gray-600 mb-4">{result.message}</p>
                
                {/* Success details */}
                <div className="text-sm text-gray-500 mb-4">
                  ✅ Đơn hàng đã được xác nhận<br/>
                  ✅ Kho hàng đã được cập nhật<br/>
                  ✅ Thống kê seller đã được cập nhật
                </div>
                
                {result.orderId && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-600">Mã đơn hàng:</p>
                    <p className="font-semibold">#{result.orderId}</p>
                    
                    {result.amount && (
                      <>
                        <p className="text-sm text-gray-600 mt-2">Số tiền:</p>
                        <p className="font-semibold text-green-600">
                          {formatCurrency(result.amount)}
                        </p>
                      </>
                    )}
                    
                    {result.transactionId && (
                      <>
                        <p className="text-sm text-gray-600 mt-2">Mã giao dịch:</p>
                        <p className="font-mono text-xs">{result.transactionId}</p>
                      </>
                    )}
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Error Icon */}
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <svg
                    className="h-6 w-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-red-600 mb-2">
                  Thanh toán thất bại!
                </h2>
                <p className="text-gray-600 mb-4">{result?.message}</p>
              </>
            )}

            <div className="flex space-x-3">
              <Button
                onClick={() => router.push('/shop')}
                variant="outline"
                className="flex-1"
              >
                Tiếp tục mua sắm
              </Button>
              
              {result?.success ? (
                <Button
                  onClick={() => router.push('/manage-orders')}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Xem đơn hàng
                </Button>
              ) : (
                <Button
                  onClick={() => router.back()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Thử lại
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

const PaymentReturnPage: React.FC = () => {
  return (
    <Suspense fallback={
      <Container>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-lg">Đang xử lý kết quả thanh toán...</div>
          </div>
        </div>
      </Container>
    }>
      <PaymentReturnContent />
    </Suspense>
  );
};

export default PaymentReturnPage;
