"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ProfileLayout from '@/components/profile/ProfileLayout';
import ProfileCard from '@/components/profile/ProfileCard';
import { Order, User } from '@/types/entities';
import useUser from '@/hooks/useUser';

const OrderManagementPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const userId = params?.id as string;
  const userData = useUser(); // Sử dụng hook useUser
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (userData === null) {
      // User hook vẫn đang loading
      return;
    }
    
    if (userData === undefined || !userData) {
      // Không có user data, chuyển về login
      router.push('/login');
      return;
    }

    // Có user data, load order management
    fetchData();
  }, [userData, userId, router]);

  const fetchData = async () => {
    try {
      const { mockUser, mockOrders } = await import('@/lib/mockData');
      const currentUserData = userData || mockUser;
      setCurrentUser(currentUserData);

      // Kiểm tra quyền truy cập - chỉ seller và chính chủ tài khoản
      if (currentUserData.role !== 'seller' || currentUserData.id.toString() !== userId) {
        router.push('/');
        return;
      }

      // Giả lập danh sách đơn hàng của seller
      const sellerOrders: Order[] = [
        ...mockOrders,
        {
          ...mockOrders[0],
          id: 2,
          status: 'pending',
          totalPrice: 45000,
          createdAt: new Date('2024-01-20T14:30:00Z')
        },
        {
          ...mockOrders[0],
          id: 3,
          status: 'confirmed',
          totalPrice: 120000,
          createdAt: new Date('2024-01-22T09:15:00Z')
        }
      ];

      setOrders(sellerOrders);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipping':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Chờ xác nhận';
      case 'confirmed':
        return 'Đã xác nhận';
      case 'shipping':
        return 'Đang giao';
      case 'delivered':
        return 'Đã giao';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      // API call để cập nhật trạng thái đơn hàng
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus, updatedAt: new Date() }
          : order
      ));
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter);

  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    shipping: orders.filter(o => o.status === 'shipping').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  };

  if (loading) {
    return (
      <ProfileLayout 
        userRole={currentUser?.role || 'seller'} 
        userId={userId} 
        isOwnProfile={true}
      >
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      </ProfileLayout>
    );
  }

  return (
    <ProfileLayout 
      userRole={currentUser?.role || 'seller'} 
      userId={userId} 
      isOwnProfile={true}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý đơn hàng</h1>
          <div className="text-sm text-gray-500">
            Tổng: {orders.length} đơn hàng
          </div>
        </div>

        {/* Thống kê nhanh */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white border rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{orderStats.total}</div>
            <div className="text-sm text-gray-500">Tổng đơn</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-800">{orderStats.pending}</div>
            <div className="text-sm text-yellow-600">Chờ xác nhận</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-800">{orderStats.confirmed}</div>
            <div className="text-sm text-blue-600">Đã xác nhận</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-800">{orderStats.shipping}</div>
            <div className="text-sm text-purple-600">Đang giao</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-800">{orderStats.delivered}</div>
            <div className="text-sm text-green-600">Đã giao</div>
          </div>
        </div>

        {/* Bộ lọc */}
        <div className="flex gap-2 flex-wrap">
          {[
            { key: 'all', label: 'Tất cả' },
            { key: 'pending', label: 'Chờ xác nhận' },
            { key: 'confirmed', label: 'Đã xác nhận' },
            { key: 'shipping', label: 'Đang giao' },
            { key: 'delivered', label: 'Đã giao' },
            { key: 'cancelled', label: 'Đã hủy' }
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === item.key
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Danh sách đơn hàng */}
        <ProfileCard title={`Đơn hàng (${filteredOrders.length})`}>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <p className="text-gray-500">Không có đơn hàng nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">Đơn hàng #{order.id}</h4>
                      <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                      <p className="text-sm text-gray-600">
                        Khách hàng: {order.buyer.user.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900 mb-2">
                        {formatPrice(order.totalPrice)}
                      </p>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      {order.items.length} sản phẩm
                    </div>
                    
                    {order.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStatusChange(order.id, 'confirmed')}
                          className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          Xác nhận
                        </button>
                        <button
                          onClick={() => handleStatusChange(order.id, 'cancelled')}
                          className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          Hủy
                        </button>
                      </div>
                    )}
                    
                    {order.status === 'confirmed' && (
                      <button
                        onClick={() => handleStatusChange(order.id, 'shipping')}
                        className="px-3 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600"
                      >
                        Giao hàng
                      </button>
                    )}
                    
                    {order.status === 'shipping' && (
                      <button
                        onClick={() => handleStatusChange(order.id, 'delivered')}
                        className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Hoàn thành
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ProfileCard>
      </div>
    </ProfileLayout>
  );
};

export default OrderManagementPage;
