import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

enum PaymentStatusEnum {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired'
}

interface PaymentStatusProps {
  paymentId?: string;
  orderId?: string;
  showDetails?: boolean;
  autoRedirect?: boolean;
  redirectDelay?: number;
}

export const PaymentStatus: React.FC<PaymentStatusProps> = ({
  paymentId,
  orderId,
  showDetails = true,
  autoRedirect = true,
  redirectDelay = 5000
}) => {
  const [status, setStatus] = useState<PaymentStatusEnum>(PaymentStatusEnum.PENDING);
  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<{
    orderId?: number; 
    amount?: number; 
    transactionId?: string;
    gateway?: string;
    gatewayTransactionId?: string;
    createdAt?: string;
  } | null>(null);
  const [countdown, setCountdown] = useState(redirectDelay / 1000);
  const router = useRouter();

  useEffect(() => {
    checkPaymentStatus();
  }, [paymentId, orderId]);

  useEffect(() => {
    if (autoRedirect && status === PaymentStatusEnum.SUCCESS && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            router.push('/profile');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [status, countdown, autoRedirect, router]);

  const checkPaymentStatus = async () => {
    if (!paymentId && !orderId) {
      setStatus(PaymentStatusEnum.FAILED);
      setLoading(false);
      return;
    }

    try {
      const endpoint = paymentId 
        ? `/api/payment/${paymentId}/status`
        : `/api/payment/order/${orderId}/status`;
        
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      const result = await response.json();

      if (result.success) {
        setStatus(result.payment.status);
        setPaymentDetails(result.payment);
        
        // Show appropriate toast
        switch (result.payment.status) {
          case PaymentStatusEnum.SUCCESS:
            toast.success('Thanh toán thành công!');
            break;
          case PaymentStatusEnum.FAILED:
            toast.error('Thanh toán thất bại!');
            break;
          case PaymentStatusEnum.CANCELLED:
            toast.error('Thanh toán đã bị hủy!');
            break;
          case PaymentStatusEnum.EXPIRED:
            toast.error('Thanh toán đã hết hạn!');
            break;
        }
      } else {
        setStatus(PaymentStatusEnum.FAILED);
        toast.error('Không thể kiểm tra trạng thái thanh toán');
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      setStatus(PaymentStatusEnum.FAILED);
      toast.error('Có lỗi xảy ra khi kiểm tra thanh toán');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case PaymentStatusEnum.SUCCESS:
        return (
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case PaymentStatusEnum.FAILED:
      case PaymentStatusEnum.CANCELLED:
      case PaymentStatusEnum.EXPIRED:
        return (
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
            <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      case PaymentStatusEnum.PENDING:
      default:
        return (
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100">
            <svg className="animate-spin h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        );
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case PaymentStatusEnum.SUCCESS:
        return {
          title: 'Thanh toán thành công!',
          message: 'Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đang được xử lý.',
          color: 'text-green-600'
        };
      case PaymentStatusEnum.FAILED:
      case PaymentStatusEnum.CANCELLED:
      case PaymentStatusEnum.EXPIRED:
        return {
          title: 'Thanh toán thất bại',
          message: 'Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.',
          color: 'text-red-600'
        };
      case PaymentStatusEnum.PENDING:
      default:
        return {
          title: 'Đang xử lý thanh toán...',
          message: 'Vui lòng đợi trong giây lát.',
          color: 'text-yellow-600'
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-gray-600">Đang kiểm tra trạng thái thanh toán...</p>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusMessage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {getStatusIcon()}
          
          <h2 className={`mt-6 text-3xl font-extrabold ${statusInfo.color}`}>
            {statusInfo.title}
          </h2>
          
          <p className="mt-2 text-sm text-gray-600">
            {statusInfo.message}
          </p>

          {status === PaymentStatusEnum.SUCCESS && autoRedirect && (
            <p className="mt-4 text-sm text-blue-600">
              Tự động chuyển về trang cá nhân sau {countdown} giây...
            </p>
          )}

          {showDetails && paymentDetails && (
            <div className="mt-6 bg-white shadow rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Chi tiết thanh toán</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Mã đơn hàng:</span>
                  <span className="font-medium">#{paymentDetails.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Số tiền:</span>
                  <span className="font-medium text-green-600">
                    {paymentDetails.amount?.toLocaleString('vi-VN')}đ
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phương thức:</span>
                  <span className="font-medium capitalize">
                    {paymentDetails.gateway === 'momo' ? 'MoMo' : 
                     paymentDetails.gateway === 'cod' ? 'COD' : 
                     paymentDetails.gateway?.toUpperCase()}
                  </span>
                </div>
                {paymentDetails.gatewayTransactionId && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mã giao dịch:</span>
                    <span className="font-medium text-xs">
                      {paymentDetails.gatewayTransactionId}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Thời gian:</span>
                  <span className="font-medium">
                    {paymentDetails.createdAt ? new Date(paymentDetails.createdAt).toLocaleString('vi-VN') : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 space-y-3">
            {status === PaymentStatusEnum.SUCCESS ? (
              <>
                <button
                  onClick={() => router.push('/profile')}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Xem đơn hàng
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Tiếp tục mua sắm
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => router.back()}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Thử lại
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Về trang chủ
                </button>
              </>
            )}
          </div>

          <div className="mt-6">
            <button
              onClick={checkPaymentStatus}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              🔄 Kiểm tra lại trạng thái
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
