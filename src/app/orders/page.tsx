"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Container from '@/components/Container';
import OrderHistory from '@/components/profile/OrderHistory';
import { Order, User, OrderStatus, UserRole } from '@/types/entities';
import { buyerApi } from '@/lib/api';
import { UserResponseDto, BuyerOrdersDto } from '@/types/dtos';
import useUser from '@/hooks/useUser';

const OrdersPage: React.FC = () => {
  const router = useRouter();
  const userData = useUser();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userData.loading) {
      return;
    }
    
    if (userData.user === null) {
      router.push('/login');
      return;
    }

    fetchData();
  }, [userData.loading, userData.user, router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const user = userData.user;
      if (!user) {
        setError('Vui lòng đăng nhập để xem đơn hàng.');
        setLoading(false);
        return;
      }

      // Chỉ cho phép buyer
      if (user.role !== 'buyer') {
        setError('Chỉ người mua hàng mới có thể xem trang này.');
        setLoading(false);
        return;
      }

      // Set current user
      setCurrentUser({
        ...user,
        password: '',
        reviews: [],
        buyer: undefined,
        seller: undefined,
      });

      // Lấy đơn hàng bằng userId - đơn giản hơn nhiều!
      console.log('Đang lấy đơn hàng cho user ID:', user.id);
      try {
        const ordersData = await buyerApi.getUserOrders(user.id);
        console.log('Dữ liệu đơn hàng:', ordersData);
        
        if (ordersData && ordersData.orders) {
          const orders: Order[] = ordersData.orders.map(orderData => ({
            id: orderData.id,
            buyerId: ordersData.buyerId,
            addressId: undefined,
            totalPrice: orderData.totalPrice,
            status: orderData.status as OrderStatus,
            note: '',
            createdAt: new Date(orderData.createdAt),
            updatedAt: new Date(orderData.createdAt),
            buyer: {
              id: ordersData.buyerId,
              userId: user.id || 0,
              user: {
                ...user,
                password: '',
                reviews: []
              },
              orders: [],
              reviews: [],
              addresses: []
            },
            items: [], // Sẽ được load riêng nếu cần
            address: undefined
          }));
          
          setOrders(orders);
          console.log('Đã load', orders.length, 'đơn hàng');
        } else {
          setOrders([]);
          console.log('Không có đơn hàng nào');
        }
      } catch (apiError) {
        console.error('Lỗi API:', apiError);
        setError('Không thể tải đơn hàng. Vui lòng thử lại.');
        setOrders([]);
      }

      setLoading(false);
    } catch (error) {
      console.error('Lỗi tổng quát:', error);
      setError('Có lỗi xảy ra. Vui lòng tải lại trang.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </Container>
    );
  }

  if (!currentUser) {
    return (
      <Container>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="text-center py-8">
            <p className="text-red-500">Không thể tải thông tin đơn hàng</p>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-6">
            {error && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <span className="text-yellow-400">⚠️</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-800">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Đơn hàng đã mua
                </h1>
                <p className="text-gray-600 mt-1">
                  Lịch sử các đơn hàng bạn đã đặt mua
                </p>
                {/* Debug info */}
                <div className="text-xs text-gray-400 mt-2">
                  Debug: User role: {currentUser?.role}, Buyer ID: {(userData.user as UserResponseDto)?.buyer?.id || 'N/A'}
                </div>
              </div>
              <div className="text-right">
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={fetchData} 
                    className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    🔄 Tải lại
                  </button>
                  <div className="text-sm text-gray-500">
                    Tổng: {orders.length} đơn hàng
                  </div>
                  {orders.length > 0 && (
                    <div className="text-xs text-gray-400">
                      Tổng chi tiêu: {orders.reduce((total, order) => total + order.totalPrice, 0).toLocaleString('vi-VN')} ₫
                    </div>
                  )}
                </div>
              </div>
            </div>

            <OrderHistory orders={orders} userRole="buyer" />
          </div>
        </div>
      </div>
    </Container>
  );
};

export default OrdersPage;
