"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Container from '@/components/Container';
import { OrderStatus } from '@/types/entities';
import { sellerApi } from '@/lib/api';
import { SellerOrdersDto } from '@/types/dtos';
import useUser from '@/hooks/useUser';

interface OrderWithDetails {
  orderId: number;
  buyerName: string;
  totalPrice: number;
  status: string;
  createdAt: Date;
  items: Array<{
    productId: number;
    productName: string;
    quantity: number;
    price: number;
  }>;
}

const ManageOrdersPage: React.FC = () => {
  const router = useRouter();
  const userData = useUser();
  
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userData === null) {
      return;
    }
    
    if (userData === undefined || !userData.user) {
      router.push('/login');
      return;
    }

    fetchData();
  }, [userData, router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const currentUserData = userData?.user;

      if (currentUserData?.role !== 'seller') {
        router.push('/');
        return;
      }

      // Lấy thông tin seller để có sellerId
      if (!currentUserData?.sellerInfo?.id) {
        setError('Không tìm thấy thông tin seller');
        return;
      }

      // Gọi API để lấy đơn hàng của seller
      const sellerOrdersData: SellerOrdersDto = await sellerApi.getSellerOrders(currentUserData.sellerInfo.id);
      
      setOrders(sellerOrdersData.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Không thể tải danh sách đơn hàng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'preparing':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'delivering':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Chờ xác nhận';
      case 'confirmed':
        return 'Đã xác nhận';
      case 'preparing':
        return 'Đang chuẩn bị';
      case 'delivering':
        return 'Đang giao hàng';
      case 'completed':
        return 'Đã hoàn thành';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      // TODO: Gọi API để cập nhật trạng thái đơn hàng
      // await orderApi.updateOrderStatus(orderId, newStatus);
      
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.orderId === orderId 
            ? { ...order, status: newStatus }
            : order
        )
      );
      
      console.log(`Đã cập nhật đơn hàng ${orderId} thành trạng thái: ${newStatus}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      setError('Không thể cập nhật trạng thái đơn hàng');
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status.toLowerCase() === filter.toLowerCase();
  });

  if (loading) {
    return (
      <Container>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="text-center">Đang tải...</div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Lỗi</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={fetchData}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Thử lại
            </button>
          </div>
        </div>
      </Container>
    );
  }

  if (!userData?.user || userData.user.role !== 'seller') {
    return (
      <Container>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Không có quyền truy cập</h1>
            <p className="text-gray-600">Chỉ người bán mới có thể truy cập trang này.</p>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h1>
              <div className="text-sm text-gray-600">
                Tổng: {orders.length} đơn hàng
              </div>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto">
              {[
                { key: 'all', label: 'Tất cả', count: orders.length },
                { key: 'pending', label: 'Chờ xác nhận', count: orders.filter(o => o.status.toLowerCase() === 'pending').length },
                { key: 'confirmed', label: 'Đã xác nhận', count: orders.filter(o => o.status.toLowerCase() === 'confirmed').length },
                { key: 'preparing', label: 'Đang chuẩn bị', count: orders.filter(o => o.status.toLowerCase() === 'preparing').length },
                { key: 'delivering', label: 'Đang giao', count: orders.filter(o => o.status.toLowerCase() === 'delivering').length },
                { key: 'completed', label: 'Đã hoàn thành', count: orders.filter(o => o.status.toLowerCase() === 'completed').length },
                { key: 'cancelled', label: 'Đã hủy', count: orders.filter(o => o.status.toLowerCase() === 'cancelled').length }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    filter === tab.key
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>

            {/* Orders list */}
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📋</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {filter === 'all' ? 'Chưa có đơn hàng nào' : 'Không có đơn hàng phù hợp'}
                </h3>
                <p className="text-gray-600">
                  {filter === 'all' 
                    ? 'Các đơn hàng sẽ xuất hiện ở đây khi có khách hàng đặt mua sản phẩm của bạn.'
                    : 'Hiện tại không có đơn hàng nào ở trạng thái này.'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div key={order.orderId} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">Đơn hàng #{order.orderId}</h3>
                        <p className="text-sm text-gray-600">
                          Khách hàng: {order.buyerName}
                        </p>
                        <p className="text-sm text-gray-600">
                          Ngày đặt: {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                        </p>
                        <div className="text-sm text-gray-600">
                          Sản phẩm: {order.items.map(item => `${item.productName} (x${item.quantity})`).join(', ')}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg text-gray-900">
                          {order.totalPrice.toLocaleString('vi-VN')}đ
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
                      
                      {order.status.toLowerCase() === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleStatusChange(order.orderId, 'confirmed')}
                            className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                          >
                            Xác nhận
                          </button>
                          <button
                            onClick={() => handleStatusChange(order.orderId, 'cancelled')}
                            className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Hủy
                          </button>
                        </div>
                      )}
                      
                      {order.status.toLowerCase() === 'confirmed' && (
                        <button
                          onClick={() => handleStatusChange(order.orderId, 'preparing')}
                          className="px-3 py-1 text-xs bg-orange-500 text-white rounded hover:bg-orange-600"
                        >
                          Chuẩn bị
                        </button>
                      )}

                      {order.status.toLowerCase() === 'preparing' && (
                        <button
                          onClick={() => handleStatusChange(order.orderId, 'delivering')}
                          className="px-3 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600"
                        >
                          Giao hàng
                        </button>
                      )}
                      
                      {order.status.toLowerCase() === 'delivering' && (
                        <button
                          onClick={() => handleStatusChange(order.orderId, 'completed')}
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
          </div>
        </div>
      </div>
    </Container>
  );
};

export default ManageOrdersPage;
