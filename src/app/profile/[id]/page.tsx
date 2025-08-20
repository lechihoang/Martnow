"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import PublicProfileCard from '@/components/profile/PublicProfileCard';
import RecentActivity from '@/components/profile/RecentActivity';
import ChatInterface from '@/components/chat/ChatInterface';
import { UserResponseDto, SellerResponseDto, BuyerResponseDto } from '@/types/dtos';
import { profileApi } from '@/lib/api';
import useUser from '@/hooks/useUser';

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const userId = params?.id as string;
  const { user: currentUser } = useUser();
  
  const [profileData, setProfileData] = useState<{
    user: UserResponseDto;
    seller?: SellerResponseDto;
    buyer?: BuyerResponseDto;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await profileApi.getFullProfile(parseInt(userId));
      setProfileData(data);
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
      router.push('/login');
      return;
    }
    
    if (currentUser.id === profileUser?.id) {
      alert('Bạn không thể nhắn tin cho chính mình!');
      return;
    }
    
    setIsChatOpen(true);
  };

  const handleViewShop = () => {
    // TODO: Navigate to shop page
    router.push(`/shop/${sellerData?.id || profileUser?.id}`);
  };
  
  const handleChatClose = () => {
    setIsChatOpen(false);
  };

  // Determine if this is own profile
  const isOwnProfile = currentUser?.id === parseInt(userId);


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header với nút back */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="px-6 py-4">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
          >
            ← Quay lại
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Profile Card chính */}
        {profileUser && (
          <PublicProfileCard
            user={profileUser}
            isOwnProfile={isOwnProfile}
            onMessage={handleMessage}
            onViewShop={handleViewShop}
          />
        )}

        {/* Grid layout cho các sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cột trái - Recent Activity */}
          <div className="lg:col-span-2">
            {profileUser && (
              <RecentActivity
                user={profileUser}
                isOwnProfile={isOwnProfile}
              />
            )}
          </div>

          {/* Cột phải - Additional Info */}
          <div className="space-y-6">
            {/* Nếu là seller - hiển thị products */}
            {profileUser?.role === 'seller' && sellerData && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Sản phẩm</h3>
                <p className="text-gray-600 text-sm">Shop có {sellerData.totalProducts || 0} sản phẩm</p>
                {/* TODO: Implement seller products view for public profile */}
              </div>
            )}

            {/* Quick Stats Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Thống kê</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Đơn hàng thành công</span>
                  <span className="font-semibold text-green-600">{sellerData?.stats?.totalOrders || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Đánh giá trung bình</span>
                  <span className="font-semibold text-yellow-600">{sellerData?.stats?.averageRating?.toFixed(1) || '0.0'}/5.0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Thời gian phản hồi</span>
                  <span className="font-semibold text-blue-600">&lt; 2h</span>
                </div>
                {profileUser?.role === 'seller' && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Sản phẩm đang bán</span>
                    <span className="font-semibold text-purple-600">{sellerData?.totalProducts || 0}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Chat Interface Modal */}
      {profileUser && (
        <ChatInterface
          targetUser={profileUser}
          isOpen={isChatOpen}
          onClose={handleChatClose}
        />
      )}
    </div>
  );
};

export default ProfilePage;
