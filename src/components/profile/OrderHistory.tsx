"use client";
import React from 'react';
import ProfileCard from './ProfileCard';
import { Order } from '@/types/entities';

interface OrderHistoryProps {
  orders: Order[];
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ orders }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'shipping':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
          <p className="text-gray-500">Bạn chưa có đơn hàng nào</p>
        </div>
      </ProfileCard>
    );
  }

  return (
    <ProfileCard title="Lịch sử đơn hàng">
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-medium text-gray-900">Đơn hàng #{order.id}</h4>
                <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {formatPrice(order.totalPrice)}
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center gap-3 text-sm">
                  <img
                    src={item.product.imageUrl || '/images/banhmi.jpeg'}
                    alt={item.product.name}
                    className="w-12 h-12 rounded object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.product.name}</p>
                    <p className="text-gray-500">
                      Số lượng: {item.quantity} × {formatPrice(item.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ProfileCard>
  );
};

export default OrderHistory;
