"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProfileLayout from '@/components/profile/ProfileLayout';
import { useAuthContext } from '@/contexts/AuthContext';
import { getUserProfile } from '@/lib/api';
import { sellerApi } from '@/lib/api';
import { User, OrderStatus } from '@/types/entities';
import { OrderResponseDto } from '@/types/dtos';
import { LoadingSpinner } from '@/components/ui';

const SalesHistoryPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const { user } = useAuthContext();
  const [userProfile, setUserProfile] = useState<User | null>(null);

  const [orders, setOrders] = useState<OrderResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profile when user changes
  useEffect(() => {
    if (user) {
      getUserProfile().then(profile => {
        setUserProfile(profile);
      });
    } else {
      setUserProfile(null);
    }
  }, [user]);

  // Fetch sales data
  useEffect(() => {
    const fetchSalesData = async () => {
      if (!user || !userProfile) return;
      
      try {
        setLoading(true);
        setError(null);

        // Check if user is seller and viewing their own profile
        if (userProfile.role !== 'SELLER') {
          setError('Chỉ người bán mới có thể xem lịch sử bán hàng.');
          setLoading(false);
          return;
        }

        if (user.id !== userId) {
          setError('Bạn chỉ có thể xem lịch sử bán hàng của chính mình.');
          setLoading(false);
          return;
        }

        // Fetch seller orders
        const ordersData = await sellerApi.getSellerOrders();
        setOrders(ordersData || []);
        
      } catch (error) {
        console.error('Error fetching sales data:', error);
        setError('Không thể tải lịch sử bán hàng. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    if (userProfile) {
      fetchSalesData();
    }
  }, [user, userProfile, userId]);

  // Redirect if not logged in
  if (!user) {
    router.push('/auth/login');
    return null;
  }

  if (loading) {
    return (
      <ProfileLayout>
        <LoadingSpinner size="xl" message="Đang tải lịch sử bán hàng..." className="min-h-[400px]" />
      </ProfileLayout>
    );
  }

  if (error) {
    return (
      <ProfileLayout>
        <div className="text-center py-8">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Lỗi</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            ← Quay lại
          </button>
        </div>
      </ProfileLayout>
    );
  }

  return (
    <ProfileLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            📊 Lịch sử bán hàng
          </h1>
          <p className="text-gray-600">
            Quản lý và theo dõi các đơn hàng đã bán
          </p>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Đơn hàng ({orders.length})
            </h2>
          </div>

          {orders.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 text-6xl mb-4">📦</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chưa có đơn hàng nào
              </h3>
              <p className="text-gray-500">
                Khi có đơn hàng, chúng sẽ xuất hiện ở đây
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {orders.map((order) => (
                <div key={order.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-500">
                          #{order.id}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                        <div className={`px-2 py-1 text-xs font-medium rounded-full ${
                          order.status === OrderStatus.PAID
                            ? 'bg-green-100 text-green-800'
                            : order.status === OrderStatus.PENDING
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status === OrderStatus.PAID ? 'Đã thanh toán' :
                           order.status === OrderStatus.PENDING ? 'Chờ thanh toán' :
                           order.status}
                        </div>
                      </div>
                      
                      {order.buyer?.user?.name && (
                        <div className="mt-2 text-sm text-gray-600">
                          Khách hàng: {order.buyer.user.name}
                        </div>
                      )}
                      
                      {order.note && (
                        <div className="mt-1 text-sm text-gray-500">
                          Ghi chú: {order.note}
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND'
                        }).format(order.totalPrice)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProfileLayout>
  );
};

export default SalesHistoryPage;
