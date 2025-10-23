'use client';

import { useAuth } from '@/hooks/useAuth';
import { orderApi, getUserProfile } from '@/lib/api';
import useStore from '@/stores/store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import CartItem from '@/components/CartItem';
import CartEmpty from '@/components/CartEmpty';
import { ShoppingBag, ArrowLeft, Trash2 } from 'lucide-react';
import PriceFormatter from '@/components/PriceFormatter';
import { toast } from 'react-hot-toast';
import { User } from '@/types/entities';

export default function CartPage() {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { cartItems, getCartTotalPrice, clearCart } = useStore();
  const router = useRouter();

  // Format currency helper
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Fetch user profile when user changes (same pattern as favorites page)
  useEffect(() => {
    console.log('🔍 Cart: Auth state changed, user:', user?.id || 'null');
    setProfileLoading(true);

    if (user) {
      console.log('🔍 Cart: User found, fetching profile...', user.id);
      getUserProfile().then(profile => {
        console.log('🔍 Cart: Profile received:', profile);
        setUserProfile(profile);
        setProfileLoading(false);
      }).catch(error => {
        console.error('❌ Cart: Error fetching user profile:', error);
        setUserProfile(null);
        setProfileLoading(false);
      });
    } else {
      console.log('🔍 Cart: No user, setting userProfile to null');
      setUserProfile(null);
      setProfileLoading(false);
    }
  }, [user]);

  // Show loading state while fetching user data (same as favorites)
  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Đang tải...
          </h2>
          <p className="text-gray-600">
            Đang tải giỏ hàng của bạn
          </p>
        </div>
      </div>
    );
  }

  // Show access denied if not logged in or not a buyer (same as favorites)
  if (!user || !userProfile || userProfile.role !== 'BUYER') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Truy cập bị từ chối
          </h2>
          <p className="text-gray-600">
            Chỉ khách hàng mới có thể xem giỏ hàng
          </p>
        </div>
      </div>
    );
  }

  const total = getCartTotalPrice();
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast.error('Giỏ hàng của bạn đang trống');
      return;
    }

    setIsProcessing(true);

    try {
      // Prepare checkout data
      const checkoutItems = cartItems.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
      }));

      console.log('🛒 Starting direct checkout from cart:', checkoutItems);

      // Call checkout API
      const result = await orderApi.checkout(checkoutItems, 'Thanh toán từ giỏ hàng');
      console.log('✅ Checkout result:', result);

      if (result.data.paymentRequired && result.data.primaryPaymentUrl) {
        const paymentUrl = result.data.primaryPaymentUrl;
        console.log('🔗 VNPay Payment URL:', paymentUrl);

        // Clear cart before redirect
        clearCart();
        toast.success('Đang chuyển đến VNPay...');

        // Redirect to VNPay
        window.location.href = paymentUrl;
      } else {
        // No payment required (free orders)
        clearCart();
        toast.success('Đặt hàng thành công!');
        router.push('/');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Thanh toán thất bại. Vui lòng thử lại.';
      console.error('❌ Direct checkout failed:', error);
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearCart = () => {
    if (confirm('Bạn có chắc chắn muốn xóa tất cả sản phẩm trong giỏ hàng?')) {
      clearCart();
      toast.success('Đã xóa tất cả sản phẩm khỏi giỏ hàng');
    }
  };

  const handleContinueShopping = () => {
    router.push('/shop');
  };

  // Empty cart
  if (cartItems.length === 0) {
    return <CartEmpty onContinueShopping={handleContinueShopping} />;
  }

  // Calculate unique sellers
  const uniqueSellers = new Set(cartItems.map(item =>
    item.product.seller?.user?.name || item.product.seller?.shopName || 'Unknown Seller'
  ));
  const sellerCount = uniqueSellers.size;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/shop')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Tiếp tục mua sắm
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <ShoppingBag className="w-8 h-8 text-blue-600" />
                Giỏ hàng của bạn
              </h1>
              <p className="text-gray-600 mt-1">
                Xin chào, {userProfile.name || userProfile.username}! Bạn có {itemCount} sản phẩm trong giỏ
              </p>
            </div>

            {cartItems.length > 0 && (
              <button
                onClick={handleClearCart}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 border border-red-300 hover:border-red-400 px-4 py-2 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Xóa tất cả
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            {/* Seller Notice */}
            {sellerCount > 1 && (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-yellow-800 text-xs font-bold">!</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-yellow-800">Thông báo</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Bạn có sản phẩm từ {sellerCount} người bán khác nhau. Chúng tôi sẽ tạo riêng đơn hàng cho mỗi người bán:
                    </p>
                    <ul className="mt-2 space-y-1">
                      {Array.from(uniqueSellers).map((sellerName, index) => (
                        <li key={index} className="text-xs text-yellow-700">• {sellerName}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Cart Items List */}
            <div className="space-y-4">
              {cartItems.map((item) => (
                <CartItem
                  key={item.product.id}
                  item={item}
                  formatCurrency={formatCurrency}
                />
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Tóm tắt đơn hàng</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Số sản phẩm:</span>
                  <span className="font-medium">{itemCount}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tạm tính:</span>
                  <PriceFormatter amount={total} />
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Tổng cộng:</span>
                    <PriceFormatter amount={total} className="text-blue-600" />
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    Thanh toán VNPay
                  </>
                )}
              </button>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-800 text-center">
                  🔒 Thanh toán an toàn qua VNPay
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
