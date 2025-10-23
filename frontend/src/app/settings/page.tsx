"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getUserProfile } from '@/lib/api';
import { UserProfile } from '@/types/auth';
import { UserRole } from '@/types/entities';
import { User as UserIcon, Lock } from 'lucide-react';
import SettingsLayout, { SettingsTab } from '@/components/settings/SettingsLayout';
import ProfileTab from '@/components/settings/ProfileTab';
import SecurityTab from '@/components/settings/SecurityTab';

const SETTINGS_TABS: SettingsTab[] = [
  {
    id: 'profile',
    label: 'Thông tin cá nhân',
    icon: UserIcon,
  },
  {
    id: 'security',
    label: 'Bảo mật',
    icon: Lock,
  },
];

const getVisibleTabs = (userRole?: UserRole): SettingsTab[] => {
  return SETTINGS_TABS.filter(tab => !tab.show || tab.show(userRole));
};

const SettingsPage: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const { user: authUser } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (authUser && authUser.id && authUser.email && authUser.aud === 'authenticated') {
        try {
          setLoading(true);
          const profileData = await getUserProfile();
          if (profileData && profileData.id) {
            setUserProfile(profileData);
          } else {
            setError('Không thể tải thông tin người dùng');
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setError('Có lỗi xảy ra khi tải thông tin người dùng');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [authUser]);

  // Redirect to login if not authenticated
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!loading && (!authUser || !userProfile)) {
        router.push('/auth/login');
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [loading, authUser, userProfile, router]);

  const visibleTabs = getVisibleTabs(userProfile?.role);

  const renderTabContent = () => {
    if (!userProfile) return null;

    switch (activeTab) {
      case 'profile':
        return (
          <ProfileTab
            user={userProfile}
            onUpdate={async () => {}}
          />
        );
      case 'security':
        return <SecurityTab />;
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

  if (error || !userProfile) {
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
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
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
      user={userProfile}
      tabs={visibleTabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {renderTabContent()}
    </SettingsLayout>
  );
};

export default SettingsPage;
