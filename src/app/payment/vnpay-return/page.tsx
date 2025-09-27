"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import useStore from '@/stores/store';
import { CheckCircle, XCircle, Loader2, Home, ShoppingBag } from 'lucide-react';
import Container from '@/components/Container';
import { toast } from 'react-hot-toast';

interface PaymentResult {
  isSuccess: boolean;
  message: string;
  transactionNo?: string;
  amount?: number;
  bankCode?: string;
  payDate?: string;
  orderId?: string;
}

const VNPayReturnPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart } = useStore();
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get all query parameters
        const params = new URLSearchParams();
        searchParams.forEach((value, key) => {
          params.append(key, value);
        });

        console.log('🔍 VNPay return params:', Object.fromEntries(params.entries()));

        // Call backend to verify payment
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/payment/vnpay-return?${params.toString()}`);
        const data = await response.json();

        console.log('✅ Payment verification result:', data);

        if (data.message === 'Payment successful') {
          setResult({
            isSuccess: true,
            message: 'Thanh toán thành công!',
            transactionNo: searchParams.get('vnp_TransactionNo') || '',
            amount: parseInt(searchParams.get('vnp_Amount') || '0'),
            bankCode: searchParams.get('vnp_BankCode') || '',
            payDate: searchParams.get('vnp_PayDate') || '',
            orderId: searchParams.get('vnp_TxnRef') || ''
          });

          // Clear cart on successful payment
          clearCart();
          toast.success('Thanh toán thành công! Đơn hàng đã được xác nhận.');
        } else {
          setResult({
            isSuccess: false,
            message: data.error || 'Thanh toán thất bại!'
          });
          toast.error('Thanh toán thất bại. Vui lòng thử lại.');
        }
      } catch (error) {
        console.error('❌ Payment verification error:', error);
        setResult({
          isSuccess: false,
          message: 'Có lỗi xảy ra khi xác thực thanh toán'
        });
        toast.error('Có lỗi xảy ra khi xác thực thanh toán');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams, clearCart]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr.length !== 14) return dateStr;
    // Format: yyyyMMddHHmmss -> dd/MM/yyyy HH:mm:ss
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    const hour = dateStr.substring(8, 10);
    const minute = dateStr.substring(10, 12);
    const second = dateStr.substring(12, 14);

    return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
  };

  const handleContinueShopping = () => {
    router.push('/shop');
  };

  const handleViewOrders = () => {
    router.push('/orders');
  };

  if (loading) {
    return (
      <Container>
        <div className="min-h-screen flex items-center justify-center py-12">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="flex flex-col items-center">
              <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Đang xác thực thanh toán...
              </h2>
              <p className="text-gray-600">Vui lòng chờ trong giây lát</p>
            </div>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="min-h-screen flex items-center justify-center py-12">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
          {result?.isSuccess ? (
            // Success State
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Thanh toán thành công!
              </h1>
              <p className="text-gray-600 mb-8">
                Cảm ơn bạn đã thanh toán. Đơn hàng của bạn đã được xác nhận.
              </p>

              {/* Payment Details */}
              <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
                <h3 className="font-semibold text-gray-900 mb-4">Chi tiết giao dịch</h3>
                <div className="space-y-3">
                  {result.orderId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mã đơn hàng:</span>
                      <span className="font-medium">{result.orderId}</span>
                    </div>
                  )}
                  {result.transactionNo && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mã giao dịch:</span>
                      <span className="font-medium">{result.transactionNo}</span>
                    </div>
                  )}
                  {result.amount && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Số tiền:</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(result.amount)}
                      </span>
                    </div>
                  )}
                  {result.bankCode && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ngân hàng:</span>
                      <span className="font-medium">{result.bankCode}</span>
                    </div>
                  )}
                  {result.payDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Thời gian:</span>
                      <span className="font-medium">{formatDate(result.payDate)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => router.push('/')}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Home className="w-5 h-5" />
                  Về trang chủ
                </button>
                <button
                  onClick={handleContinueShopping}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Tiếp tục mua sắm
                </button>
              </div>
            </div>
          ) : (
            // Error State
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
                <XCircle className="w-12 h-12 text-red-600" />
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Thanh toán thất bại
              </h1>
              <p className="text-gray-600 mb-8">
                {result?.message || 'Đã có lỗi xảy ra trong quá trình thanh toán.'}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => router.push('/cart')}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Quay lại giỏ hàng
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Home className="w-5 h-5" />
                  Về trang chủ
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
};

export default VNPayReturnPage;
