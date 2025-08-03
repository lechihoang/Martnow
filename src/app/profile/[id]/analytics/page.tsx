"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ProfileLayout from '@/components/profile/ProfileLayout';
import SellerStats from '@/components/profile/SellerStats';
import ProfileCard from '@/components/profile/ProfileCard';
import { Stats, User, Order } from '@/types/entities';

const AnalyticsPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const userId = params?.id as string;
  
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    pendingOrders: 0
  });
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const { mockUser, mockStats, mockOrders } = await import('@/lib/mockData');
      setCurrentUser(mockUser);

      // Kiểm tra quyền truy cập - chỉ seller và chính chủ tài khoản
      if (mockUser.role !== 'seller' || mockUser.id.toString() !== userId) {
        router.push('/');
        return;
      }

      setStats(mockStats);
      setRecentOrders(mockOrders.slice(0, 5)); // 5 đơn hàng gần nhất
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Dữ liệu cho biểu đồ doanh thu theo tháng (giả lập)
  const monthlyRevenue = [
    { month: 'T1', revenue: 2500000 },
    { month: 'T2', revenue: 3200000 },
    { month: 'T3', revenue: 2800000 },
    { month: 'T4', revenue: 3500000 },
    { month: 'T5', revenue: 4100000 },
    { month: 'T6', revenue: 3800000 },
  ];

  const maxRevenue = Math.max(...monthlyRevenue.map(m => m.revenue));

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

        {/* Thống kê tổng quan */}
        <SellerStats stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Biểu đồ doanh thu */}
          <ProfileCard title="Doanh thu theo tháng">
            <div className="space-y-4">
              {monthlyRevenue.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-8 text-sm text-gray-600">{item.month}</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                    <div 
                      className="bg-green-500 h-4 rounded-full transition-all duration-500"
                      style={{ width: `${(item.revenue / maxRevenue) * 100}%` }}
                    ></div>
                  </div>
                  <div className="w-24 text-sm font-medium text-gray-900 text-right">
                    {formatPrice(item.revenue)}
                  </div>
                </div>
              ))}
            </div>
          </ProfileCard>

          {/* Đơn hàng gần đây */}
          <ProfileCard title="Đơn hàng gần đây">
            {recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-2">📋</div>
                <p className="text-gray-500">Chưa có đơn hàng nào</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">#{order.id}</div>
                      <div className="text-sm text-gray-500">{formatDate(order.createdAt)}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        {formatPrice(order.totalPrice)}
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        order.status === 'delivered' 
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {order.status === 'delivered' ? 'Đã giao' : 
                         order.status === 'pending' ? 'Chờ xử lý' : 'Đang xử lý'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ProfileCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top sản phẩm bán chạy */}
          <ProfileCard title="Sản phẩm bán chạy">
            <div className="space-y-3">
              {[
                { name: 'Bánh mì thịt nướng', sold: 45, revenue: 1125000 },
                { name: 'Bánh mì pate', sold: 32, revenue: 640000 },
                { name: 'Bánh mì chả cá', sold: 28, revenue: 840000 },
              ].map((product, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-500">Đã bán: {product.sold}</div>
                  </div>
                  <div className="text-sm font-semibold text-green-600">
                    {formatPrice(product.revenue)}
                  </div>
                </div>
              ))}
            </div>
          </ProfileCard>

          {/* Đánh giá */}
          <ProfileCard title="Đánh giá cửa hàng">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-500 mb-2">4.8</div>
              <div className="flex justify-center gap-1 mb-2">
                {[1,2,3,4,5].map((star) => (
                  <span key={star} className="text-yellow-400 text-lg">⭐</span>
                ))}
              </div>
              <div className="text-sm text-gray-500">Từ 127 đánh giá</div>
              <div className="mt-4 space-y-2">
                {[
                  { stars: 5, count: 89 },
                  { stars: 4, count: 28 },
                  { stars: 3, count: 7 },
                  { stars: 2, count: 2 },
                  { stars: 1, count: 1 },
                ].map((rating) => (
                  <div key={rating.stars} className="flex items-center gap-2 text-xs">
                    <span>{rating.stars}⭐</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{ width: `${(rating.count / 127) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-gray-500">{rating.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </ProfileCard>

          {/* Tăng trưởng */}
          <ProfileCard title="Tăng trưởng">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Doanh thu tháng này</span>
                <div className="text-right">
                  <div className="font-semibold text-green-600">+15.3%</div>
                  <div className="text-xs text-gray-500">vs tháng trước</div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Đơn hàng mới</span>
                <div className="text-right">
                  <div className="font-semibold text-blue-600">+8.7%</div>
                  <div className="text-xs text-gray-500">vs tháng trước</div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Khách hàng mới</span>
                <div className="text-right">
                  <div className="font-semibold text-purple-600">+22.1%</div>
                  <div className="text-xs text-gray-500">vs tháng trước</div>
                </div>
              </div>
            </div>
          </ProfileCard>
        </div>
      </div>
    </ProfileLayout>
  );
};

export default AnalyticsPage;
