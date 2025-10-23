"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { User, MapPin, Calendar, Star, Package, MessageCircle, ArrowLeft, Eye, ShoppingBag } from 'lucide-react';

import { UserResponseDto, SellerResponseDto, BuyerResponseDto } from '@/types/dtos';
import { userApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const userId = params?.id as string;
  const { user: currentUser } = useAuth();

  const [profileData, setProfileData] = useState<{
    user: UserResponseDto;
    seller?: SellerResponseDto;
    buyer?: BuyerResponseDto;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('info');


  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await userApi.getProfileById(userId);
      const userData = response.data;

      // Transform User to the expected profile data structure
      setProfileData({
        user: userData as unknown as UserResponseDto,
        seller: undefined,
        buyer: undefined
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile data:', error);
      setError('Không thể tải thông tin người dùng');
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      router.push('/');
      return;
    }

    fetchUserData();
  }, [userId, router, fetchUserData]);

  // Extract data for easier use
  const profileUser = profileData?.user;
  const sellerData = profileData?.seller;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8">
            <div className="text-red-500 text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Không tìm thấy người dùng
            </h2>
            <p className="text-gray-500 mb-4">
              {error || 'Người dùng này không tồn tại hoặc đã bị xóa'}
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

  const handleMessage = () => {
    if (!currentUser) {
      router.push('/auth/login');
      return;
    }
    
    if (currentUser.id === profileUser?.id?.toString()) {
      alert('Bạn không thể nhắn tin cho chính mình!');
      return;
    }
    
    // Chat functionality removed
    alert('Tính năng chat đã được tạm thời vô hiệu hóa');
  };

  const handleViewShop = () => {
    // TODO: Navigate to shop page
    router.push(`/shop/${sellerData?.id || profileUser?.id}`);
  };

  // Determine if this is own profile
  const isOwnProfile = currentUser?.id === userId;


  const tabs = [
    { id: 'info', label: 'Thông tin', icon: User },
    ...(profileUser?.role === 'SELLER' ? [
      { id: 'products', label: 'Sản phẩm', icon: Package },
      { id: 'reviews', label: 'Đánh giá', icon: Star }
    ] : []),
    { id: 'activity', label: 'Hoạt động', icon: Eye }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Thông tin cá nhân</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Tên hiển thị</label>
                  <p className="text-gray-900">{profileUser?.name || 'Chưa cập nhật'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Tên người dùng</label>
                  <p className="text-gray-900">{profileUser?.username || 'Chưa cập nhật'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{profileUser?.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Số điện thoại</label>
                  <p className="text-gray-900">{'Chưa cập nhật'}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-500">Địa chỉ</label>
                  <p className="text-gray-900">{'Chưa cập nhật'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Ngày tham gia</label>
                  <p className="text-gray-900">{new Date(profileUser?.createdAt || '').toLocaleDateString('vi-VN')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Vai trò</label>
                  <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                    profileUser?.role === 'SELLER'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {profileUser?.role === 'SELLER' ? 'Người bán' : 'Khách hàng'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'products':
        return (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Sản phẩm</h3>
              <span className="text-sm text-gray-500">{sellerData?.totalProducts || 0} sản phẩm</span>
            </div>
            <div className="text-center py-8 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Chức năng hiển thị sản phẩm đang được phát triển</p>
            </div>
          </div>
        );

      case 'reviews':
        return (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Đánh giá</h3>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="font-semibold">{sellerData?.stats?.averageRating?.toFixed(1) || '0.0'}</span>
              </div>
            </div>
            <div className="text-center py-8 text-gray-500">
              <Star className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Chức năng hiển thị đánh giá đang được phát triển</p>
            </div>
          </div>
        );

      case 'activity':
        return (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Hoạt động gần đây</h3>
            <div className="text-center py-8 text-gray-500">
              <Eye className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Chức năng hiển thị hoạt động đang được phát triển</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          {/* Cover Photo */}
          <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>

          {/* Profile Info */}
          <div className="px-6 py-6">
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Avatar */}
              <div className="relative -mt-16 md:-mt-12">
                <div className="w-24 h-24 bg-white p-1 rounded-full shadow-lg">
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {profileUser?.name?.charAt(0)?.toUpperCase() || profileUser?.username?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {profileUser?.name || profileUser?.username || 'Người dùng'}
                    </h1>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        profileUser?.role === 'SELLER'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {profileUser?.role === 'SELLER' ? 'Người bán' : 'Khách hàng'}
                      </span>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Tham gia {new Date(profileUser?.createdAt || '').toLocaleDateString('vi-VN')}
                      </div>
                      {profileUser?.seller?.shopAddress && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {profileUser.seller.shopAddress}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    {!isOwnProfile && (
                      <>
                        <button
                          onClick={handleMessage}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Nhắn tin
                        </button>
                        {profileUser?.role === 'SELLER' && (
                          <button
                            onClick={handleViewShop}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2"
                          >
                            <ShoppingBag className="w-4 h-4" />
                            Xem cửa hàng
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Stats */}
                {profileUser?.role === 'SELLER' && sellerData && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{sellerData.totalProducts || 0}</div>
                      <div className="text-sm text-gray-600">Sản phẩm</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{sellerData.stats?.totalOrders || 0}</div>
                      <div className="text-sm text-gray-600">Đơn hàng</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Star className="w-5 h-5 text-yellow-500 fill-current" />
                        <span className="text-2xl font-bold text-gray-900">
                          {sellerData.stats?.averageRating?.toFixed(1) || '0.0'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">Đánh giá</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">&lt; 2h</div>
                      <div className="text-sm text-gray-600">Phản hồi</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
};

export default ProfilePage;
