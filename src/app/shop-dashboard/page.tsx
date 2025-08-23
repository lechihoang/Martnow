"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Container from '@/components/Container';
import useUser from '@/hooks/useUser';

// Tab components
import PaidOrdersTab from '@/components/shop/PaidOrdersTab';
import ProductsTab from '@/components/shop/ProductsTab';
import SalesAnalyticsTab from '@/components/shop/SalesAnalyticsTab';

type TabType = 'orders' | 'products' | 'analytics';

const ShopDashboard: React.FC = () => {
  const router = useRouter();
  const userData = useUser();
  const [activeTab, setActiveTab] = useState<TabType>('orders');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userData === null) {
      return; // Still loading
    }
    
    if (userData === undefined || !userData?.user) {
      router.push('/login');
      return;
    }

    if (userData.user.role !== 'seller') {
      router.push('/');
      return;
    }

    setLoading(false);
  }, [userData, router]);

  if (loading) {
    return (
      <Container>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
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

  const tabs = [
    { key: 'orders' as TabType, label: 'Đơn hàng đã thanh toán', icon: '💳' },
    { key: 'products' as TabType, label: 'Quản lý sản phẩm', icon: '📦' },
    { key: 'analytics' as TabType, label: 'Biểu đồ doanh số', icon: '📊' }
  ];

  return (
    <Container>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  🏪 Cửa hàng của tôi
                </h1>
                <p className="text-gray-600 mt-1">
                  Quản lý cửa hàng của bạn một cách dễ dàng
                </p>
              </div>
              <button
                onClick={() => router.push('/add')}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
              >
                ➕ Thêm sản phẩm mới
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="flex border-b border-gray-200">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === tab.key
                      ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                      : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'orders' && <PaidOrdersTab />}
              {activeTab === 'products' && <ProductsTab />}
              {activeTab === 'analytics' && <SalesAnalyticsTab />}
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default ShopDashboard;
