"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { getHeadersWithContentType } from '@/lib/api';

interface CartOrderSummaryProps {
  items: any[];
  checkoutResult: any;
  showPayment: boolean;
  isCreatingOrder: boolean;
  onCreateOrder: () => void;
  onContinueShopping: () => void;
  formatCurrency: (amount: number) => string;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  user: any; // Truyền user từ parent component
}

const CartOrderSummary: React.FC<CartOrderSummaryProps> = ({
  items,
  checkoutResult,
  showPayment,
  isCreatingOrder,
  onCreateOrder,
  formatCurrency,
  getTotalPrice,
  user,
}) => {

  const handleCancelOrder = async (orderId: number) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/orders/cart/cancel/${orderId}`, {
        method: 'DELETE',
        headers: await getHeadersWithContentType(),
      });
      
      if (response.ok) {
        toast.success('Đã hủy đơn hàng thành công!');
        window.location.reload();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Không thể hủy đơn hàng');
      }
    } catch {
      toast.error('Có lỗi xảy ra khi hủy đơn hàng');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border sticky top-4">
      <h3 className="text-lg font-semibold mb-4">Tóm tắt đơn hàng</h3>
      
      {/* Hiển thị thông tin sellers */}
      {(() => {
        const uniqueSellers = new Set(items.map(item => item.product?.seller?.user?.name || 'Unknown Seller'));
        const sellerCount = uniqueSellers.size;
        
        return sellerCount > 1 && (
          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg mb-4">
            <div className="text-sm text-yellow-800">
              📝 <strong>Lưu ý:</strong> Bạn có sản phẩm từ {sellerCount} người bán khác nhau:
              <ul className="mt-2 space-y-1">
                {Array.from(uniqueSellers).map((sellerName, index) => (
                  <li key={index} className="text-xs">• {sellerName}</li>
                ))}
              </ul>
              <p className="text-xs mt-2 italic">
                Chúng tôi sẽ tạo riêng đơn hàng cho mỗi người bán.
              </p>
            </div>
          </div>
        );
      })()}
      
      <div className="space-y-3 mb-4">
        <div className="flex justify-between text-sm">
          <span>Tạm tính:</span>
          <span>{formatCurrency(getTotalPrice())}</span>
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
          onClick={onCreateOrder}
          disabled={isCreatingOrder || items.length === 0 || !user}
          className="w-full bg-blue-600 hover:bg-blue-700 mb-3"
        >
          {isCreatingOrder ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Đang tạo đơn hàng...</span>
            </div>
          ) : !user ? (
            'Vui lòng đăng nhập để thanh toán'
          ) : (
            'Tiến hành thanh toán VNPAY'
          )}
        </Button>
      ) : (
        <>
          {checkoutResult && (
            <>
              <div className="text-center text-green-600 font-medium mb-4">
                ✓ Đã tạo thành công {checkoutResult.orders.length} đơn hàng!
              </div>
              
              {/* Hiển thị thông tin các orders */}
              <div className="space-y-2 mb-4">
                {checkoutResult.orders.map((order: any) => (
                  <div key={order.id} className="bg-gray-50 p-3 rounded-lg text-sm">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">Đơn hàng #{order.id}</span>
                        <span className="text-blue-600 font-bold ml-2">
                          {formatCurrency(order.totalPrice)}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                        onClick={() => handleCancelOrder(order.id)}
                      >
                        Hủy đơn
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              {checkoutResult.sellerCount > 1 && (
                <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800 mb-4">
                  📝 Bạn có sản phẩm từ {checkoutResult.sellerCount} người bán khác nhau nên đã tạo {checkoutResult.orders.length} đơn hàng riêng biệt.
                </div>
              )}
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng tiền:</span>
                  <span className="text-green-600">
                    {formatCurrency(checkoutResult.totalAmount)}
                  </span>
                </div>
              </div>
              
              {/* Nút thanh toán cho tất cả orders */}
              <button
                onClick={() => {
                  if (checkoutResult.primaryPaymentUrl) {
                    window.location.href = checkoutResult.primaryPaymentUrl;
                  }
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg mb-3"
              >
                Tiến hành thanh toán VNPAY
              </button>
              
              
              {/* Hiển thị các payment links riêng lẻ nếu cần */}
              {checkoutResult.paymentInfos && checkoutResult.paymentInfos.length > 1 && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 text-center">Hoặc thanh toán từng đơn:</p>
                  {checkoutResult.paymentInfos.map((payment: any) => (
                    <button
                      key={payment.orderId}
                      onClick={() => window.location.href = payment.paymentUrl}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm py-2 px-3 rounded"
                    >
                      Thanh toán đơn #{payment.orderId} - {formatCurrency(payment.amount)}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      <div className="mt-4 text-xs text-gray-500 text-center">
        {!showPayment ? (
          'Nhấn "Tiến hành thanh toán VNPAY" để tạo đơn hàng và thanh toán'
        ) : (
          'Nhấn "Tiến hành thanh toán VNPAY" để chuyển đến VNPay'
        )}
      </div>
    </div>
  );
}

export default CartOrderSummary;
