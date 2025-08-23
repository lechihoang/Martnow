"use client";
import React, { useState } from 'react';
import ProfileCard from './ProfileCard';
import { Order } from '@/types/entities';

interface OrderHistoryProps {
  orders: Order[];
  userRole?: 'buyer' | 'seller';
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ orders, userRole = 'buyer' }) => {
  const [activeTab, setActiveTab] = useState<string>('all');

  // Định nghĩa các tabs theo role
  const getTabsForRole = (role: string) => {
    if (role === 'buyer') {
      // Nếu chỉ có đơn hàng paid, chỉ hiển thị tab "Tất cả"
      const hasPaidOrdersOnly = orders.every(order => order.status.toLowerCase() === 'paid');
      
      if (hasPaidOrdersOnly && orders.length > 0) {
        return [
          { key: 'all', label: 'Đơn hàng đã mua', count: orders.length },
        ];
      }
      
      // Fallback cho trường hợp có nhiều trạng thái
      return [
        { key: 'all', label: 'Tất cả', count: orders.length },
        { key: 'pending', label: 'Chờ xác nhận', count: orders.filter(order => order.status.toLowerCase() === 'pending').length },
        { key: 'confirmed', label: 'Đã xác nhận', count: orders.filter(order => order.status.toLowerCase() === 'confirmed').length },
        { key: 'preparing', label: 'Đang chuẩn bị', count: orders.filter(order => order.status.toLowerCase() === 'preparing').length },
        { key: 'delivering', label: 'Đang giao hàng', count: orders.filter(order => ['delivering', 'shipping'].includes(order.status.toLowerCase())).length },
        { key: 'completed', label: 'Đã nhận hàng', count: orders.filter(order => ['completed', 'delivered'].includes(order.status.toLowerCase())).length },
        { key: 'cancelled', label: 'Đã hủy', count: orders.filter(order => order.status.toLowerCase() === 'cancelled').length },
        { key: 'paid', label: 'Đã thanh toán', count: orders.filter(order => order.status.toLowerCase() === 'paid').length },
      ].filter(tab => tab.count > 0 || tab.key === 'all'); // Chỉ hiển thị tab có đơn hàng
    } else {
      return [
        { key: 'all', label: 'Tất cả', count: orders.length },
        { key: 'pending', label: 'Chờ xác nhận', count: orders.filter(order => order.status.toLowerCase() === 'pending').length },
        { key: 'confirmed', label: 'Đã nhận đơn', count: orders.filter(order => order.status.toLowerCase() === 'confirmed').length },
        { key: 'preparing', label: 'Đang chuẩn bị', count: orders.filter(order => order.status.toLowerCase() === 'preparing').length },
        { key: 'delivering', label: 'Đã giao shipper', count: orders.filter(order => ['delivering', 'shipping'].includes(order.status.toLowerCase())).length },
        { key: 'completed', label: 'Hoàn thành', count: orders.filter(order => ['completed', 'delivered'].includes(order.status.toLowerCase())).length },
        { key: 'cancelled', label: 'Đã hủy', count: orders.filter(order => order.status.toLowerCase() === 'cancelled').length },
      ];
    }
  };

  const tabs = getTabsForRole(userRole);

  // Filter orders theo tab đang active
  const getFilteredOrders = () => {
    if (activeTab === 'all') return orders;
    
    switch (activeTab) {
      case 'pending':
        return orders.filter(order => order.status.toLowerCase() === 'pending');
      case 'confirmed':
        return orders.filter(order => order.status.toLowerCase() === 'confirmed');
      case 'preparing':
        return orders.filter(order => order.status.toLowerCase() === 'preparing');
      case 'delivering':
        return orders.filter(order => ['delivering', 'shipping'].includes(order.status.toLowerCase()));
      case 'completed':
        return orders.filter(order => ['completed', 'delivered'].includes(order.status.toLowerCase()));
      case 'cancelled':
        return orders.filter(order => order.status.toLowerCase() === 'cancelled');
      case 'paid':
        return orders.filter(order => order.status.toLowerCase() === 'paid');
      default:
        return orders;
    }
  };

  const filteredOrders = getFilteredOrders();
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'preparing':
        return 'bg-orange-100 text-orange-800';
      case 'delivering':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      // Legacy status mappings
      case 'shipping':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string, role: string) => {
    const statusLower = status.toLowerCase();
    
    // Buyer perspective (người mua)
    if (role === 'buyer') {
      switch (statusLower) {
        case 'pending':
          return 'Chờ xác nhận';
        case 'confirmed':
          return 'Đã xác nhận';
        case 'preparing':
          return 'Đang chuẩn bị';
        case 'delivering':
          return 'Đang giao hàng';
        case 'completed':
          return 'Đã nhận hàng';
        case 'cancelled':
          return 'Đã hủy';
        case 'paid':
          return 'Đã thanh toán';
        // Legacy status
        case 'shipping':
          return 'Đang giao hàng';
        case 'delivered':
          return 'Đã nhận hàng';
        default:
          return status;
      }
    }
    
    // Seller perspective (người bán)
    if (role === 'seller') {
      switch (statusLower) {
        case 'pending':
          return 'Chờ xác nhận';
        case 'confirmed':
          return 'Đã nhận đơn';
        case 'preparing':
          return 'Đang chuẩn bị';
        case 'delivering':
          return 'Đã giao shipper';
        case 'completed':
          return 'Hoàn thành';
        case 'cancelled':
          return 'Đã hủy';
        // Legacy status
        case 'shipping':
          return 'Đã giao shipper';
        case 'delivered':
          return 'Hoàn thành';
        default:
          return status;
      }
    }
    
    return status;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Kiểm tra xem date có hợp lệ không
    if (!dateObj || isNaN(dateObj.getTime())) {
      return 'Ngày không hợp lệ';
    }
    
    return dateObj.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (orders.length === 0) {
    return (
      <ProfileCard title="Lịch sử đơn hàng">
        <div className="text-center py-8">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <p className="text-gray-500">Bạn chưa có đơn hàng nào đã thanh toán</p>
          <p className="text-xs text-gray-400 mt-2">Các đơn hàng chờ thanh toán sẽ không được hiển thị ở đây</p>
        </div>
      </ProfileCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                    activeTab === tab.key
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Orders List */}
      <ProfileCard title={`${tabs.find(tab => tab.key === activeTab)?.label || 'Đơn hàng'} (${filteredOrders.length})`}>
        {filteredOrders.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <p className="text-gray-500">
              Không có đơn hàng nào đã thanh toán
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Chỉ hiển thị các đơn hàng đã hoàn tất thanh toán
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
          <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-medium text-gray-900">Đơn hàng #{order.id}</h4>
                <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status, userRole)}
                </span>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {formatPrice(order.totalPrice)}
                </p>
              </div>
            </div>
            
            {/* Chi tiết sản phẩm */}
            <div className="space-y-2">
              {order.items && order.items.length > 0 ? (
                <>
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 text-sm bg-gray-50 p-3 rounded-lg">
                      <img
                        src={item.product.imageUrl || '/images/banhmi.jpeg'}
                        alt={item.product.name}
                        className="w-12 h-12 rounded object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.product.name}</p>
                        <p className="text-gray-500">
                          {item.quantity} x {formatPrice(item.price)} = <span className="font-semibold text-gray-700">{formatPrice(item.quantity * item.price)}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {/* Tổng kết sản phẩm */}
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      <strong>Tổng cộng:</strong> {order.items.reduce((total, item) => total + item.quantity, 0)} sản phẩm
                      {order.items.length > 1 && (
                        <span className="ml-2 text-gray-500">({order.items.length} loại khác nhau)</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Chi tiết: {order.items.map(item => `${item.product.name} x${item.quantity}`).join(', ')}
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                  <p>Không có thông tin chi tiết sản phẩm</p>
                </div>
              )}
            </div>
          </div>
        ))}
          </div>
        )}
      </ProfileCard>
    </div>
  );
};

export default OrderHistory;
