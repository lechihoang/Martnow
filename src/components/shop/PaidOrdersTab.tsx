"use client";

import React, { useState, useEffect } from 'react';
import { sellerApi } from '@/lib/api';
import { OrderStatus } from '@/types/entities';
import useUser from '@/hooks/useUser';

interface PaidOrder {
  id: number;
  buyerName: string;
  totalPrice: number;
  status: OrderStatus;
  createdAt: Date;
  itemCount: number;
}

const PaidOrdersTab: React.FC = () => {
  const userData = useUser();
  const [orders, setOrders] = useState<PaidOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userData?.user?.seller?.id) {
      fetchPaidOrders();
    }
  }, [userData]);

  const fetchPaidOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Chỉ lấy đơn hàng đã thanh toán (completed)
      const response = await sellerApi.getSellerOrders(userData!.user!.seller!.id);
      
      // Filter chỉ lấy đơn hàng completed (đã thanh toán)
      const paidOrders = response.orders?.filter(order => 
        order.status?.toLowerCase() === 'completed'
      ) || [];
      
      setOrders(paidOrders);
    } catch (error) {
      console.error('Error fetching paid orders:', error);
      setError('Không thể tải danh sách đơn hàng đã thanh toán');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        <span className="ml-3 text-gray-600">Đang tải đơn hàng...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Lỗi</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button 
          onClick={fetchPaidOrders}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">💳</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Chưa có đơn hàng đã thanh toán
        </h3>
        <p className="text-gray-600">
          Các đơn hàng đã hoàn thành thanh toán sẽ xuất hiện ở đây.
        </p>
      </div>
    );
  }

  const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);

  return (
    <div>
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-green-600 text-2xl mr-3">💰</div>
            <div>
              <p className="text-sm text-green-600 font-medium">Tổng doanh thu</p>
              <p className="text-xl font-bold text-green-700">
                {totalRevenue.toLocaleString('vi-VN')}đ
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-blue-600 text-2xl mr-3">📦</div>
            <div>
              <p className="text-sm text-blue-600 font-medium">Đơn hàng đã bán</p>
              <p className="text-xl font-bold text-blue-700">{orders.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-purple-600 text-2xl mr-3">📊</div>
            <div>
              <p className="text-sm text-purple-600 font-medium">Doanh thu trung bình</p>
              <p className="text-xl font-bold text-purple-700">
                {orders.length > 0 ? Math.round(totalRevenue / orders.length).toLocaleString('vi-VN') : 0}đ
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">Đơn hàng #{order.id}</h3>
                <p className="text-sm text-gray-600">
                  Khách hàng: <span className="font-medium">{order.buyerName}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Ngày mua: {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-lg text-green-600">
                  {order.totalPrice.toLocaleString('vi-VN')}đ
                </p>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  ✅ Đã thanh toán
                </span>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="border-t pt-3 mt-3">
              <p className="text-sm text-gray-600">
                Tổng số sản phẩm: <span className="font-medium">{order.itemCount}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaidOrdersTab;
