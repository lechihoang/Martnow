"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getUserProfile } from '@/lib/api';
import { User, Settings, Shield, LogOut, ChevronRight, Calendar, Mail, Phone, MapPin } from 'lucide-react';
import { UserProfile } from '@/types/auth';

const AccountPage: React.FC = () => {
  const router = useRouter();
  const { user, signout } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user && user.id && user.email && user.aud === 'authenticated') {
        try {
          const profileData = await getUserProfile();
          if (profileData && profileData.id) {
            setUserProfile(profileData);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
      setLoading(false);
    };

    fetchUserProfile();
  }, [user]);

  // Don't redirect - show access denied message instead (like favorites/cart pattern)
  // This prevents race condition with getUserProfile API call

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <h2 className="text-lg font-semibold text-gray-900">Đang tải thông tin tài khoản...</h2>
            <p className="text-sm text-gray-600 text-center">
              Vui lòng chờ trong giây lát
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !userProfile) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await signout();
      router.push('/');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const menuItems = [
    {
      title: 'Thông tin cá nhân',
      description: 'Chỉnh sửa tên, email và thông tin cơ bản',
      icon: User,
      href: '/settings',
      color: 'text-blue-600 bg-blue-50'
    },
    {
      title: 'Bảo mật & Quyền riêng tư',
      description: 'Đổi mật khẩu, xác thực 2FA, quyền riêng tư',
      icon: Shield,
      href: '/settings',
      color: 'text-green-600 bg-green-50'
    },
    {
      title: 'Đơn hàng của tôi',
      description: 'Xem lịch sử đặt hàng và trạng thái giao hàng',
      icon: Settings,
      href: '/orders',
      color: 'text-purple-600 bg-purple-50',
      hidden: userProfile.role === 'SELLER'
    }
  ];

  const visibleMenuItems = menuItems.filter(item => !item.hidden);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium mb-4"
          >
            ← Quay lại
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý tài khoản</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Profile Overview Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {userProfile.name?.charAt(0)?.toUpperCase() || userProfile.username?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl font-bold text-gray-900">
                  {userProfile.name || userProfile.username || 'Người dùng'}
                </h2>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  userProfile.role === 'SELLER'
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {userProfile.role === 'SELLER' ? 'Người bán' : 'Khách hàng'}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{userProfile.email}</span>
                </div>
                {userProfile.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{userProfile.phone}</span>
                  </div>
                )}
                {userProfile.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{userProfile.address}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Tham gia từ {new Date(userProfile.createdAt || '').toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="text-right">
              <button
                onClick={() => router.push('/settings')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm mb-2"
              >
                Chỉnh sửa
              </button>
            </div>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {visibleMenuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => router.push(item.href)}
              className="bg-white rounded-xl shadow-lg p-6 text-left hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </div>
            </button>
          ))}
        </div>

        {/* Quick Stats for Seller */}
        {userProfile.role === 'SELLER' && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Thống kê nhanh</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">0</div>
                <div className="text-sm text-gray-600">Sản phẩm</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">0</div>
                <div className="text-sm text-gray-600">Đơn hàng</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">0₫</div>
                <div className="text-sm text-gray-600">Doanh thu</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">5.0</div>
                <div className="text-sm text-gray-600">Đánh giá</div>
              </div>
            </div>
          </div>
        )}

        {/* Logout Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Đăng xuất</h3>
              <p className="text-sm text-gray-600">Thoát khỏi tài khoản hiện tại</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;