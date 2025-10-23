'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import PriceFormatter from '@/components/PriceFormatter';
import { orderApi, getUserProfile } from '@/lib/api';
import { Package, Calendar, CreditCard, Eye } from 'lucide-react';
import { User } from '@/types/entities';
import { OrderResponseDto } from '@/types/dtos';
import Image from 'next/image';

export default function OrderPage() {
  const [orders, setOrders] = useState<OrderResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  const fetchOrders = React.useCallback(async () => {
    if (!user?.id) {
      console.log('❌ No user ID found');
      return;
    }

    console.log('✅ User ID:', user.id);
    console.log('🔍 Calling getUserOrders API...');

    try {
      setError(null);

      const result = await orderApi.getUserOrders(user.id);
      console.log('📦 Raw API result:', result);

      let allOrders: OrderResponseDto[] = [];

      // Backend controller trả về {message, data: Order[]} - đã filter PAID ở backend
      if (result?.data && Array.isArray(result.data)) {
        allOrders = result.data;
      } else if (result && Array.isArray(result)) {
        allOrders = result;
      }

      console.log('📦 Paid orders from backend:', allOrders);

      setOrders(allOrders);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải đơn hàng');
    }
  }, [user]);

  // Fetch user profile and orders when user changes
  useEffect(() => {
    const initializePage = async () => {
      setLoading(true);

      if (!user) {
        setUserProfile(null);
        setLoading(false);
        return;
      }

      try {
        const profile = await getUserProfile();
        setUserProfile(profile);

        // Fetch orders if user is BUYER
        if (profile && profile.role === 'BUYER') {
          await fetchOrders();
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    initializePage();
  }, [user, fetchOrders]); // Re-run when user changes

  const formatDate = (dateInput: string | Date) => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Show loading state while fetching user data (same as other pages)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Đang tải...
          </h2>
          <p className="text-gray-600">
            Đang tải đơn hàng của bạn
          </p>
        </div>
      </div>
    );
  }

  // Show access denied if not logged in or not a buyer (same pattern as other pages)
  if (!user || !userProfile || userProfile.role !== 'BUYER') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Truy cập bị từ chối
          </h2>
          <p className="text-gray-600">
            Chỉ khách hàng mới có thể xem đơn hàng đã mua
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Package className="w-16 h-16 text-red-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Lỗi tải đơn hàng</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <Package className="w-24 h-24 text-gray-300 mx-auto mb-6" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Chưa có đơn hàng nào
          </h2>
          <p className="text-gray-600 mb-8">
            Bạn chưa có đơn hàng đã hoàn thành nào. Hãy mua sắm ngay!
          </p>
          <button
            onClick={() => router.push('/shop')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Đi mua sắm
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Đơn hàng đã mua</h1>
        <p className="text-gray-600">Danh sách các đơn hàng đã hoàn thành của bạn</p>
      </div>

      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow-md border border-gray-200">
            {/* Order Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Package className="w-6 h-6 text-gray-500" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Đơn hàng #{order.id}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(order.createdAt)}
                      </div>
                      <div className="flex items-center gap-1">
                        <CreditCard className="w-4 h-4" />
                        <PriceFormatter amount={order.totalPrice} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    Đã hoàn thành
                  </span>
                  <button
                    onClick={() => router.push(`/order/${order.id}`)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Chi tiết
                  </button>
                </div>
              </div>
            </div>

            {/* Order Items Preview */}
            <div className="p-6">
              <div className="space-y-3">
                {order.items.slice(0, 3).map((item, index) => (
                  <div key={`${order.id}-${item.id}-${index}`} className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden relative">
                      {item.product.imageUrl ? (
                        <Image
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                      <p className="text-sm text-gray-500">
                        Số lượng: {item.quantity} × <PriceFormatter amount={item.price} />
                      </p>
                    </div>
                  </div>
                ))}

                {order.items.length > 3 && (
                  <p className="text-sm text-gray-500 text-center py-2">
                    Và {order.items.length - 3} sản phẩm khác...
                  </p>
                )}
              </div>

              {order.note && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Ghi chú:</span> {order.note}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}