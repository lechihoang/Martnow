'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProfileLayout from '@/components/profile/ProfileLayout';
import { Stats, Order, OrderStatus } from '../../../../types/entities';
import { useAuth } from '@/hooks/useAuth';
import { sellerApi } from '@/lib/api';
import { TrendingUp, ShoppingBag, Users, Package, DollarSign, Calendar } from 'lucide-react';

const AnalyticsPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const { user: currentUser } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  
  // Fetch user profile when currentUser changes
  useEffect(() => {
          if (currentUser) {
        sellerApi.getSellerProfile().then(profile => {
          setUserProfile(profile);
        });
      } else {
      setUserProfile(null);
    }
  }, [currentUser]);

  const [stats, setStats] = useState<Stats>({
    totalSales: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    averageOrderValue: 0,
    totalProducts: 0,
    totalCustomers: 0,
    monthlySales: [],
    topProducts: []
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      // Kiểm tra quyền truy cập - chỉ seller và chính chủ tài khoản
      if (!userProfile || userProfile.role !== 'SELLER' || currentUser.id !== userId) {
        router.push('/');
        return;
      }

      const response = await sellerApi.getAnalytics(userId);
      setStats(response.data);

      const ordersResponse = await sellerApi.getOrdersBySellerId(userId);
      setRecentOrders(ordersResponse.data);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  }, [currentUser, userId, router]);

  useEffect(() => {
    if (!currentUser) {
      router.push('/auth/login');
      return;
    }

    fetchData();
  }, [currentUser, userId, router, fetchData]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PAID:
        return 'bg-green-100 text-green-800';
      case OrderStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case OrderStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PAID:
        return 'Đã thanh toán';
      case OrderStatus.PENDING:
        return 'Chờ xử lý';
      case OrderStatus.CANCELLED:
        return 'Đã hủy';
      default:
        return 'Không xác định';
    }
  };

  if (loading) {
    return (
      <ProfileLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      </ProfileLayout>
    );
  }

  return (
    <ProfileLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Thống kê & Phân tích</h1>
          <div className="flex gap-2">
            <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
              <option>7 ngày qua</option>
              <option>30 ngày qua</option>
              <option>3 tháng qua</option>
              <option>Năm nay</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng doanh thu</p>
                <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.totalSales)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <ShoppingBag className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng đơn hàng</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sản phẩm</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Khách hàng</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Sales Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Doanh thu theo tháng</h3>
            <div className="space-y-3">
              {stats.monthlySales.map((month, index) => (
                <div key={month.month} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{month.month}</span>
                  <div className="flex items-center space-x-4">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: `${(month.sales / Math.max(...stats.monthlySales.map(m => m.sales))) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-20 text-right">
                      {formatPrice(month.sales)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sản phẩm bán chạy</h3>
            <div className="space-y-4">
              {stats.topProducts.map((product, index) => (
                <div key={product.productId} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mr-3">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{product.productName}</p>
                      <p className="text-xs text-gray-500">Đã bán: {product.totalSold}</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {formatPrice(product.revenue)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Đơn hàng gần đây</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã đơn
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thời gian
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng tiền
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ghi chú
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatPrice(order.totalPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {order.note || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ProfileLayout>
  );
};

export default AnalyticsPage;
