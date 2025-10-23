"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { orderApi } from '@/lib/api';

interface SalesData {
  date: string;
  revenue: number;
  orders: number;
}

interface SellerOrder {
  orderId: number;
  orderStatus: string;
  orderDate: string;
  paidDate: string;
  buyerName: string;
  buyerEmail: string;
  sellerTotal: number;
  items: Array<{
    productId: number;
    productName: string;
    quantity: number;
    price: number;
  }>;
}

const SalesAnalyticsTab: React.FC = () => {
  const { user } = useAuth();
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [timeRange, setTimeRange] = useState<'hour' | 'day' | 'month'>('day');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSalesData = React.useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      console.log('📊 Fetching seller orders...');

      // Lấy dữ liệu từ API
      const response = await orderApi.getSellerOrders(user.id);
      const orders: SellerOrder[] = (response as unknown as SellerOrder[]) || [];

      console.log('📦 Seller orders:', orders);

      // Tính khoảng thời gian và số lượng items
      let periods: number;
      const startDate = new Date();

      if (timeRange === 'hour') {
        // 24 giờ gần nhất
        periods = 24;
        startDate.setHours(startDate.getHours() - 24);
      } else if (timeRange === 'day') {
        // 7 ngày gần nhất
        periods = 7;
        startDate.setDate(startDate.getDate() - 7);
      } else {
        // 6 tháng gần nhất
        periods = 6;
        startDate.setMonth(startDate.getMonth() - 6);
      }

      // Lọc đơn hàng trong khoảng thời gian
      const filteredOrders = orders.filter(order => {
        const orderDate = new Date(order.paidDate || order.orderDate);
        return orderDate >= startDate;
      });

      console.log('📅 Filtered orders:', filteredOrders.length);

      // Nhóm đơn hàng theo period
      const salesByPeriod = new Map<string, { revenue: number; orders: number }>();

      // Khởi tạo tất cả các periods
      for (let i = periods - 1; i >= 0; i--) {
        const date = new Date();
        let key: string;

        if (timeRange === 'hour') {
          date.setHours(date.getHours() - i);
          key = `${date.getHours()}h`;
        } else if (timeRange === 'day') {
          date.setDate(date.getDate() - i);
          key = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
        } else {
          date.setMonth(date.getMonth() - i);
          key = date.toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' });
        }

        salesByPeriod.set(key, { revenue: 0, orders: 0 });
      }

      // Tính doanh thu và số đơn hàng cho mỗi period
      filteredOrders.forEach(order => {
        const orderDate = new Date(order.paidDate || order.orderDate);
        let key: string;

        if (timeRange === 'hour') {
          key = `${orderDate.getHours()}h`;
        } else if (timeRange === 'day') {
          key = orderDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
        } else {
          key = orderDate.toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' });
        }

        const existing = salesByPeriod.get(key);
        if (existing) {
          existing.revenue += order.sellerTotal;
          existing.orders += 1;
        }
      });

      // Chuyển Map thành mảng
      const salesArray: SalesData[] = Array.from(salesByPeriod.entries()).map(([date, data]) => ({
        date,
        revenue: data.revenue,
        orders: data.orders
      }));

      console.log('📈 Sales data:', salesArray);

      setSalesData(salesArray);
    } catch (err) {
      console.error('❌ Error fetching sales data:', err);
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải dữ liệu');
      setSalesData([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, timeRange]);

  useEffect(() => {
    if (user?.id) {
      fetchSalesData();
    }
  }, [user?.id, fetchSalesData]);

  const totalRevenue = salesData.reduce((sum, day) => sum + day.revenue, 0);
  const totalOrders = salesData.reduce((sum, day) => sum + day.orders, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        <span className="ml-3 text-gray-600">Đang tải dữ liệu...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Lỗi tải dữ liệu</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchSalesData}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          Thử lại
        </button>
      </div>
    );
  }

  const maxRevenue = Math.max(...salesData.map(d => d.revenue), 1);

  return (
    <div>
      {/* Time Range Selector */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Biểu đồ doanh số</h2>
        <div className="flex bg-gray-100 rounded-lg p-1">
          {[
            { key: 'hour' as const, label: 'Theo giờ' },
            { key: 'day' as const, label: 'Theo ngày' },
            { key: 'month' as const, label: 'Theo tháng' }
          ].map(option => (
            <button
              key={option.key}
              onClick={() => setTimeRange(option.key)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                timeRange === option.key
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="text-green-600 text-3xl mr-4">💰</div>
            <div>
              <p className="text-sm text-green-600 font-medium">Tổng doanh thu</p>
              <p className="text-2xl font-bold text-green-700">
                {totalRevenue.toLocaleString('vi-VN')}đ
              </p>
              <p className="text-xs text-green-600 mt-1">
                {timeRange === 'hour' ? '24 giờ qua' : timeRange === 'day' ? '7 ngày qua' : '6 tháng qua'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="text-blue-600 text-3xl mr-4">📦</div>
            <div>
              <p className="text-sm text-blue-600 font-medium">Tổng đơn hàng</p>
              <p className="text-2xl font-bold text-blue-700">{totalOrders}</p>
              <p className="text-xs text-blue-600 mt-1">
                {salesData.length > 0
                  ? `Trung bình ${Math.round(totalOrders / salesData.length)} đơn/ngày`
                  : 'Chưa có dữ liệu'
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="text-purple-600 text-3xl mr-4">🎯</div>
            <div>
              <p className="text-sm text-purple-600 font-medium">Giá trị TB/đơn</p>
              <p className="text-2xl font-bold text-purple-700">
                {Math.round(avgOrderValue).toLocaleString('vi-VN')}đ
              </p>
              <p className="text-xs text-purple-600 mt-1">
                Mỗi đơn hàng
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {totalOrders === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-gray-400 text-6xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Chưa có dữ liệu doanh số
          </h3>
          <p className="text-gray-600">
            Chưa có đơn hàng nào được thanh toán trong {timeRange === 'hour' ? '24 giờ' : timeRange === 'day' ? '7 ngày' : '6 tháng'} qua
          </p>
        </div>
      )}

      {/* Revenue Chart */}
      {totalOrders > 0 && (
        <>
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Doanh thu {timeRange === 'hour' ? 'theo giờ' : timeRange === 'day' ? 'theo ngày' : 'theo tháng'}
            </h3>
            <div className="space-y-2">
              {salesData.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-16 text-xs text-gray-600 flex-shrink-0">
                    {item.date}
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="bg-gray-200 rounded-full h-6 relative">
                      <div
                        className="bg-gradient-to-r from-green-400 to-green-600 h-6 rounded-full transition-all duration-300"
                        style={{ width: `${(item.revenue / maxRevenue) * 100}%`, minWidth: item.revenue > 0 ? '20px' : '0' }}
                      />
                      {item.revenue > 0 && (
                        <div className="absolute inset-0 flex items-center px-2">
                          <span className="text-xs font-medium text-white truncate">
                            {item.revenue.toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="w-16 text-xs text-gray-600 text-right flex-shrink-0">
                    {item.orders} đơn
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Orders Chart */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Số đơn hàng {timeRange === 'hour' ? 'theo giờ' : timeRange === 'day' ? 'theo ngày' : 'theo tháng'}
            </h3>
            <div className="flex items-end justify-between h-64 gap-1">
              {salesData.map((item, index) => {
                const maxOrders = Math.max(...salesData.map(d => d.orders), 1);
                const height = (item.orders / maxOrders) * 100;

                return (
                  <div key={index} className="flex flex-col items-center flex-1 min-w-0 group">
                    <div
                      className="bg-blue-500 hover:bg-blue-600 transition-colors rounded-t relative group-hover:bg-blue-700 cursor-pointer w-full"
                      style={{ height: `${height}%`, minHeight: item.orders > 0 ? '4px' : '0' }}
                      title={`${item.date}: ${item.orders} đơn hàng`}
                    >
                      {item.orders > 0 && (
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <div className="bg-gray-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
                            {item.orders} đơn
                          </div>
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 mt-2 truncate max-w-full">
                      {item.date}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SalesAnalyticsTab;
