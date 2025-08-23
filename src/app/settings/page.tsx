"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/types/entities';
import { useSettingsData } from '@/hooks/useSettingsData';
import { getVisibleTabs } from '@/constants/settingsTabs';
import SettingsLayout from '@/components/settings/SettingsLayout';
import ProfileTab from '@/components/settings/ProfileTab';
import ShopTab from '@/components/settings/ShopTab';
import SecurityTab from '@/components/settings/SecurityTab';
import NotificationsTab from '@/components/settings/NotificationsTab';
import PrivacyTab from '@/components/settings/PrivacyTab';

const SettingsPage: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  
  const {
    user,
    seller,
    loading,
    error,
    handleUpdateUser,
    handleUpdateSeller,
    handleCreateSeller
  } = useSettingsData();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  const visibleTabs = getVisibleTabs(user?.role);

  const renderTabContent = () => {
    if (!user) return null;

    switch (activeTab) {
      case 'profile':
        return (
          <ProfileTab 
            user={user} 
            onUpdate={handleUpdateUser} 
          />
        );
      case 'shop':
        return user.role === UserRole.SELLER ? (
          <ShopTab 
            seller={seller}
            onUpdate={handleUpdateSeller}
            onCreate={handleCreateSeller}
          />
        ) : null;
      case 'security':
        return <SecurityTab />;
      case 'notifications':
        return <NotificationsTab />;
      case 'privacy':
        return <PrivacyTab />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-8">
            <div className="text-red-500 text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Không thể tải thông tin
            </h2>
            <p className="text-gray-500 mb-4">
              {error || 'Có lỗi xảy ra khi tải thông tin người dùng'}
            </p>
            <button
              onClick={() => router.back()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              ← Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SettingsLayout
      user={user}
      tabs={visibleTabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {renderTabContent()}
    </SettingsLayout>
  );
};

export default SettingsPage;
