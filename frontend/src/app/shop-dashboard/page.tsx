"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getUserProfile } from '@/lib/api';
import { UserProfile } from '@/types/auth';

// Tab components
import PaidOrdersTab from '@/components/shop/PaidOrdersTab';
import ProductsTab from '@/components/shop/ProductsTab';
import SalesAnalyticsTab from '@/components/shop/SalesAnalyticsTab';

type TabType = 'orders' | 'products' | 'analytics';

const ShopDashboard: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('orders');
  const [profileLoading, setProfileLoading] = useState(true);

  // Fetch user profile when user changes (same pattern as cart/favorites)
  useEffect(() => {
    console.log('🔍 Shop Dashboard: Auth state changed, user:', user?.id || 'null');
    setProfileLoading(true);

    if (user) {
      console.log('🔍 Shop Dashboard: User found, fetching profile...', user.id);
      getUserProfile().then(profile => {
        console.log('🔍 Shop Dashboard: Profile received:', profile);
        setUserProfile(profile);
        setProfileLoading(false);
      }).catch(error => {
        console.error('❌ Shop Dashboard: Error fetching user profile:', error);
        setUserProfile(null);
        setProfileLoading(false);
      });
    } else {
      console.log('🔍 Shop Dashboard: No user, setting userProfile to null');
      setUserProfile(null);
      setProfileLoading(false);
    }
  }, [user]);

  // Show loading state while fetching user data (same as cart/favorites)
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400"></div>
            <h2 className="text-lg font-semibold text-gray-900">Đang tải quản lý cửa hàng...</h2>
            <p className="text-sm text-gray-600 text-center">
              Vui lòng chờ trong giây lát
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show access denied if not logged in or not a seller (same as cart/favorites pattern)
  if (!user || !userProfile || userProfile.role !== 'SELLER') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🏪</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Truy cập bị từ chối
          </h2>
          <p className="text-gray-600">
            Chỉ người bán mới có thể truy cập trang quản lý cửa hàng
          </p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { key: 'orders' as TabType, label: 'Đơn hàng đã thanh toán', icon: '💳', description: 'Xem các đơn hàng đã được thanh toán' },
    { key: 'products' as TabType, label: 'Quản lý sản phẩm', icon: '📦', description: 'Thêm, sửa, xóa sản phẩm của bạn' },
    { key: 'analytics' as TabType, label: 'Thống kê doanh thu', icon: '📊', description: 'Xem biểu đồ và báo cáo doanh số' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              🏪 Quản lý cửa hàng
            </h1>
            <p className="text-gray-600 mt-1">
              Quản lý cửa hàng của bạn một cách dễ dàng
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-gray-700 to-gray-800 text-white">
                <h2 className="font-semibold">Danh mục quản lý</h2>
                <p className="text-gray-300 text-sm">Chọn chức năng bạn muốn sử dụng</p>
              </div>

              <nav className="p-2">
                {menuItems.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setActiveTab(item.key)}
                    className={`w-full text-left p-4 rounded-lg mb-2 transition-all duration-200 group ${
                      activeTab === item.key
                        ? 'bg-emerald-50 border-l-4 border-emerald-600 text-emerald-700'
                        : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium">{item.label}</div>
                        <div className="text-sm text-gray-500 mt-1 group-hover:text-gray-600">
                          {item.description}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 sm:p-6">
                {activeTab === 'orders' && <PaidOrdersTab userProfile={userProfile} />}
                {activeTab === 'products' && <ProductsTab />}
                {activeTab === 'analytics' && <SalesAnalyticsTab />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopDashboard;
