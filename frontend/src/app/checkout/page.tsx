'use client';

import { useAuth } from '@/hooks/useAuth';
import { orderApi } from '@/lib/api';
import useStore from '@/stores/store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import PriceFormatter from '@/components/PriceFormatter';
import { toast } from 'react-hot-toast';
import { ArrowLeft, CreditCard, ShoppingBag } from 'lucide-react';

interface CheckoutOrder {
  id: number;
  totalPrice: number;
}

interface CheckoutResult {
  data: {
    paymentRequired: boolean;
    orders: CheckoutOrder[];
    primaryPaymentUrl?: string;
  };
}

export default function CheckoutPage() {
  const { user } = useAuth();
  const { cartItems, clearCart } = useStore();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'review' | 'processing' | 'payment'>('review');
  const [note, setNote] = useState('');

  // Redirect if not authenticated or no items
  useEffect(() => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để thanh toán');
      router.push('/auth/login');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Giỏ hàng trống');
      router.push('/cart');
      return;
    }
  }, [user, cartItems, router]);

  const total = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const handleCheckout = async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    setStep('processing');

    try {
      // Prepare checkout data
      const checkoutItems = cartItems.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
      }));

      console.log('🛒 Cart items count:', cartItems.length);
      console.log('🛒 Starting checkout with items:', checkoutItems);
      console.log('🛒 Total on frontend:', total);

      // Step 1: Create orders
      const result = await orderApi.checkout(checkoutItems, note) as CheckoutResult;
      console.log('✅ Checkout result:', result);

      setStep('payment');

      // Step 2: Handle payment
      if (result.data.paymentRequired && result.data.primaryPaymentUrl) {
        console.log('💳 Using payment URL from checkout:', result.data.primaryPaymentUrl);

        // Clear cart before redirect
        clearCart();

        // Redirect to VNPay
        window.location.href = result.data.primaryPaymentUrl;
      } else {
        // No payment required (free orders)
        clearCart();
        toast.success('Đặt hàng thành công!');
        router.push('/');
      }
    } catch (error) {
      console.error('❌ Checkout failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Thanh toán thất bại';
      toast.error(errorMessage);
      setStep('review');
    } finally {
      setIsProcessing(false);
    }
  };


  if (!user || cartItems.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/cart')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại giỏ hàng
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Thanh toán</h1>
          <p className="text-gray-600 mt-1">Xem lại đơn hàng và hoàn tất thanh toán</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Đơn hàng của bạn
              </h2>

              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.product.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center">
                      <ShoppingBag className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                      <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
                      <PriceFormatter amount={item.product.price} className="text-gray-600" />
                    </div>
                    <div className="text-right">
                      <PriceFormatter
                        amount={item.product.price * item.quantity}
                        className="font-medium text-gray-900"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Note */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ghi chú đơn hàng (tùy chọn)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Thêm ghi chú cho đơn hàng..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Tổng thanh toán
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tổng sản phẩm:</span>
                  <span>{cartItems.length} sản phẩm</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Tạm tính:</span>
                  <PriceFormatter amount={total} />
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Tổng cộng:</span>
                    <PriceFormatter amount={total} className="text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={isProcessing || step !== 'review'}
                className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
              >
                {step === 'review' && !isProcessing && (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Thanh toán qua VNPay
                  </>
                )}
                {step === 'processing' && (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Đang xử lý...
                  </>
                )}
                {step === 'payment' && (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Đang chuyển hướng...
                  </>
                )}
              </button>

              {/* Payment Info */}
              <div className="mt-4 p-3 bg-blue-50 rounded-md">
                <p className="text-xs text-blue-800">
                  🔒 Thanh toán an toàn qua VNPay. Bạn sẽ được chuyển đến trang thanh toán của VNPay.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}