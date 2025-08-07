import React, { useState } from 'react';
import toast from 'react-hot-toast';

export enum PaymentMethod {
  COD = 'cod',
  MOMO = 'momo',
  VNPAY = 'vnpay'
}

interface PaymentMethodSelectorProps {
  onMethodSelect: (method: PaymentMethod) => void;
  selectedMethod: PaymentMethod;
  disabled?: boolean;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  onMethodSelect,
  selectedMethod,
  disabled = false
}) => {
  const paymentMethods = [
    {
      id: PaymentMethod.COD,
      name: 'Thanh toán khi nhận hàng (COD)',
      icon: '💵',
      description: 'Thanh toán bằng tiền mặt khi nhận hàng',
      available: true
    },
    {
      id: PaymentMethod.MOMO,
      name: 'Ví MoMo',
      icon: '📱',
      description: 'Thanh toán qua ví điện tử MoMo',
      available: true
    },
    {
      id: PaymentMethod.VNPAY,
      name: 'VNPay',
      icon: '🏦',
      description: 'Thanh toán qua ngân hàng, thẻ ATM',
      available: false // Sẽ implement sau
    }
  ];

  return (
    <div className="payment-methods space-y-3">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Chọn phương thức thanh toán
      </h3>
      
      {paymentMethods.map(method => (
        <div
          key={method.id}
          className={`
            payment-method p-4 border rounded-lg cursor-pointer transition-all
            ${selectedMethod === method.id 
              ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
              : 'border-gray-200 hover:border-gray-300'
            }
            ${!method.available || disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          onClick={() => {
            if (method.available && !disabled) {
              onMethodSelect(method.id);
            } else if (!method.available) {
              toast.error('Phương thức thanh toán này chưa khả dụng');
            }
          }}
        >
          <div className="flex items-center">
            <span className="text-2xl mr-3">{method.icon}</span>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">{method.name}</h4>
                {selectedMethod === method.id && (
                  <span className="text-blue-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">{method.description}</p>
              {!method.available && (
                <p className="text-xs text-amber-600 mt-1">🚧 Đang phát triển</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

interface MoMoPaymentProps {
  orderId: string;
  amount: number;
  orderInfo: string;
  onSuccess?: (result: any) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

export const MoMoPayment: React.FC<MoMoPaymentProps> = ({
  orderId,
  amount,
  orderInfo,
  onSuccess,
  onError,
  disabled = false
}) => {
  const [loading, setLoading] = useState(false);

  const handleMoMoPayment = async () => {
    if (disabled) return;
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/payment/momo/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          orderId,
          amount,
          orderInfo
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Đang chuyển đến MoMo...');
        
        // Check if mobile device
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );

        if (isMobile && result.deeplink) {
          // Try to open MoMo app directly
          window.location.href = result.deeplink;
          
          // Fallback to web after a delay
          setTimeout(() => {
            if (document.visibilityState === 'visible') {
              window.location.href = result.payUrl;
            }
          }, 2000);
        } else {
          // Open MoMo web payment
          window.location.href = result.payUrl;
        }
        
        onSuccess?.(result);
      } else {
        throw new Error(result.message || 'Không thể tạo thanh toán MoMo');
      }

    } catch (error: any) {
      console.error('MoMo payment error:', error);
      toast.error(error.message || 'Có lỗi xảy ra khi thanh toán');
      onError?.(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleMoMoPayment}
      disabled={loading || disabled}
      className={`
        w-full flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all
        ${disabled 
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
          : loading
          ? 'bg-pink-400 text-white cursor-wait'
          : 'bg-pink-500 hover:bg-pink-600 text-white hover:shadow-lg transform hover:scale-105'
        }
      `}
    >
      {loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Đang xử lý...
        </>
      ) : (
        <>
          <img 
            src="/momo-logo.svg" 
            alt="MoMo" 
            width="24" 
            height="24" 
            className="mr-2"
            onError={(e) => {
              // Fallback if logo not found
              e.currentTarget.style.display = 'none';
            }}
          />
          <span className="text-2xl mr-2">📱</span>
          Thanh toán MoMo
        </>
      )}
    </button>
  );
};

// COD Payment Component
interface CODPaymentProps {
  orderId: number;
  amount: number;
  orderInfo: string;
  onSuccess?: (result: any) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

export const CODPayment: React.FC<CODPaymentProps> = ({
  orderId,
  amount,
  orderInfo,
  onSuccess,
  onError,
  disabled = false
}) => {
  const [loading, setLoading] = useState(false);

  const handleCODPayment = async () => {
    if (disabled) return;
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/payment/cod/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          orderId,
          amount,
          orderInfo
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Đặt hàng thành công! Bạn sẽ thanh toán khi nhận hàng.');
        onSuccess?.(result);
      } else {
        throw new Error(result.message || 'Không thể tạo đơn hàng COD');
      }

    } catch (error: any) {
      console.error('COD payment error:', error);
      toast.error(error.message || 'Có lỗi xảy ra');
      onError?.(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCODPayment}
      disabled={loading || disabled}
      className={`
        w-full flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all
        ${disabled 
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
          : loading
          ? 'bg-green-400 text-white cursor-wait'
          : 'bg-green-500 hover:bg-green-600 text-white hover:shadow-lg transform hover:scale-105'
        }
      `}
    >
      {loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Đang xử lý...
        </>
      ) : (
        <>
          <span className="text-2xl mr-2">💵</span>
          Xác nhận đặt hàng COD
        </>
      )}
    </button>
  );
};
