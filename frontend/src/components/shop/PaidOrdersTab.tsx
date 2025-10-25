"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { getAuthHeaders } from '@/lib/api';
import { OrderStatus } from '@/types/entities';

interface PaidOrder {
  id: number;
  buyerName: string;
  totalPrice: number;
  status: OrderStatus;
  createdAt: Date;
  itemCount: number;
}

interface PaidOrdersTabProps {
  userProfile: { id: string } | null;
}

const PaidOrdersTab: React.FC<PaidOrdersTabProps> = ({ userProfile }) => {
  const [orders, setOrders] = useState<PaidOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPaidOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!userProfile?.id) {
        setError('Không thể tải thông tin người dùng. Vui lòng đăng nhập lại.');
        setLoading(false);
        return;
      }

      console.log('🔍 Fetching paid orders for seller:', userProfile.id);

      // Sử dụng API mới để lấy đơn hàng PAID của seller
      const headers = await getAuthHeaders();
      console.log('🔒 Auth headers prepared');

      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/order/seller/${userProfile.id}`;
      console.log('📡 API URL:', apiUrl);

      const response = await fetch(apiUrl, { headers });

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', errorText);
        throw new Error(`Không thể tải danh sách đơn hàng (${response.status})`);
      }

      const result = await response.json();
      console.log('📦 Seller orders response:', result);

      const paidOrders = result.data || [];

      // Transform data to match component interface
      const transformedOrders = paidOrders.map((order: {
        orderId: number;
        buyerName: string;
        sellerTotal: number;
        orderDate: string;
        items?: unknown[];
      }) => ({
        id: order.orderId,
        buyerName: order.buyerName,
        totalPrice: order.sellerTotal,
        status: 'paid' as const,
        createdAt: new Date(order.orderDate),
        itemCount: order.items?.length || 0
      }));

      setOrders(transformedOrders);
    } catch (error) {
      console.error('Error fetching paid orders:', error);
      setError('Không thể tải danh sách đơn hàng đã thanh toán');
    } finally {
      setLoading(false);
    }
  }, [userProfile?.id]);

  useEffect(() => {
    if (userProfile?.id) {
      fetchPaidOrders();
    }
  }, [userProfile?.id, fetchPaidOrders]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
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
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-6 h-full">
          <div className="flex items-center h-full">
            <div className="text-green-600 text-3xl mr-4">💰</div>
            <div>
              <p className="text-sm text-green-600 font-medium">Tổng doanh thu</p>
              <p className="text-2xl font-bold text-green-700">
                {totalRevenue.toLocaleString('vi-VN')}đ
              </p>
              <p className="text-xs text-green-600 mt-1">
                Từ {orders.length} đơn đã thanh toán
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6 h-full">
          <div className="flex items-center h-full">
            <div className="text-blue-600 text-3xl mr-4">📦</div>
            <div>
              <p className="text-sm text-blue-600 font-medium">Tổng đơn hàng</p>
              <p className="text-2xl font-bold text-blue-700">{orders.length}</p>
              <p className="text-xs text-blue-600 mt-1">
                Đơn hàng đã hoàn thành
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-6 h-full">
          <div className="flex items-center h-full">
            <div className="text-purple-600 text-3xl mr-4">🎯</div>
            <div>
              <p className="text-sm text-purple-600 font-medium">Giá trị TB/đơn</p>
              <p className="text-2xl font-bold text-purple-700">
                {Math.round(totalRevenue / orders.length).toLocaleString('vi-VN')}đ
              </p>
              <p className="text-xs text-purple-600 mt-1">
                Mỗi đơn hàng
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Danh sách đơn hàng đã thanh toán</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã đơn hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số lượng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tổng tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.buyerName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.itemCount} sản phẩm
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    {order.totalPrice.toLocaleString('vi-VN')}đ
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Đã thanh toán
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaidOrdersTab;
