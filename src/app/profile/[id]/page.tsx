"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import PublicProfileCard from '@/components/profile/PublicProfileCard';
import RecentActivity from '@/components/profile/RecentActivity';
import SellerProducts from '@/components/profile/SellerProducts';
import { User, Seller, UserRole } from '@/types/entities';
import { userApi, sellerApi } from '@/lib/api';
import useUser from '@/hooks/useUser';

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const userId = params?.id as string;
  const userData = useUser(); // Sử dụng hook useUser
  
  const [user, setUser] = useState<User | null>(null);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debug logging
  console.log('ProfilePage - Debug Info:', {
    params,
    userId,
    userDataLoading: userData.loading,
    userDataUser: userData.user
  });

  // Debug alert để test
  useEffect(() => {
    if (userId) {
      console.log('✅ UserId found:', userId);
    } else {
      console.log('❌ UserId NOT found. Params:', params);
      alert(`Debug: userId = ${userId}, params = ${JSON.stringify(params)}`);
    }
  }, [userId, params]);

  useEffect(() => {
    console.log('useEffect triggered with:', { userId, userDataLoading: userData.loading });
    
    if (!userId) {
      console.log('No userId found, redirecting to home');
      router.push('/');
      return;
    }
    
    if (userData.loading) {
      // User hook vẫn đang loading
      return;
    }
    
    if (userData.user === null) {
      // Không có user data, chuyển về login
      router.push('/login');
      return;
    }

    // Có user data, load profile
    fetchUserData();
  }, [userId, userData.loading, userData.user?.id]); // Chỉ depend vào userId và user id thay vì toàn bộ userData.user

  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Kiểm tra userData có hợp lệ không
      if (!userData.user) {
        setError('Không thể lấy thông tin người dùng');
        setLoading(false);
        return;
      }

      // Sử dụng dữ liệu từ useUser hook
      const currentUserData = userData.user;
      
      // Convert UserResponseDto to User if needed
      const userAsUser: User = {
        ...currentUserData,
        password: '', // UserResponseDto doesn't have password for security
        reviews: [], // Default empty array
        buyer: undefined,
        seller: undefined,
      };

      // Chỉ setCurrentUser một lần khi chưa có hoặc khác
      if (!currentUser || currentUser.id !== userAsUser.id) {
        setCurrentUser(userAsUser);
      }

      // Nếu xem profile của chính mình
      if (currentUserData?.id && userId === currentUserData.id.toString()) {
        setUser(userAsUser);
        
        if (currentUserData.role === 'seller') {
          // Lấy thông tin seller thật từ API
          try {
            const sellerData = await sellerApi.getSellerByUserId(currentUserData.id);
            // Convert SellerResponseDto to Seller entity (simplified)
            const sellerEntity = {
              ...sellerData,
              user: userAsUser, // Use current user data
              products: [], // Default empty array
              stats: undefined // Simplify stats for now
            } as Seller;
            setSeller(sellerEntity);
          } catch (error) {
            console.error('Error fetching seller info:', error);
            // Nếu chưa có seller profile, set null để có thể tạo mới
            setSeller(null);
          }
        }
      } else {
        // Lấy thông tin user khác qua API
        try {
          const otherUserData = await userApi.getProfile(parseInt(userId));
          const otherUser: User = {
            ...otherUserData,
            password: '', // Không hiển thị password
            reviews: [], // Default empty array
            buyer: undefined,
            seller: undefined,
          };
          setUser(otherUser);
          
          // Nếu user khác là seller, lấy thông tin seller
          if (otherUser.role === 'seller') {
            try {
              const sellerData = await sellerApi.getSellerByUserId(parseInt(userId));
              const sellerEntity = {
                ...sellerData,
                user: otherUser,
                products: [],
                stats: undefined
              } as Seller;
              setSeller(sellerEntity);
            } catch (sellerError) {
              console.error('Error fetching seller info for other user:', sellerError);
              setSeller(null);
            }
          }
        } catch (error) {
          console.error('Error fetching other user data:', error);
          setError('Không thể tải thông tin người dùng');
        }
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Không thể tải thông tin người dùng');
      setLoading(false);
    }
  }, [userData.user?.id, userId]); // Đơn giản hóa dependency

  // Tính toán isOwnProfile ngay sau khi có currentUser
  const isOwnProfile = currentUser && currentUser.id ? currentUser.id.toString() === userId : false;

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

  if (error || !user) {
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
    // TODO: Implement messaging feature
    alert('Tính năng nhắn tin đang được phát triển!');
  };

  const handleViewShop = () => {
    // TODO: Navigate to shop page
    router.push(`/shop/${seller?.id || user.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header với nút back */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
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
        <PublicProfileCard
          user={user}
          isOwnProfile={isOwnProfile}
          onMessage={handleMessage}
          onViewShop={handleViewShop}
        />

        {/* Grid layout cho các sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cột trái - Recent Activity */}
          <div className="lg:col-span-2">
            <RecentActivity
              user={user}
              isOwnProfile={isOwnProfile}
            />
          </div>

          {/* Cột phải - Additional Info */}
          <div className="space-y-6">
            {/* Nếu là seller - hiển thị products */}
            {user.role === UserRole.SELLER && seller && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Sản phẩm</h3>
                <p className="text-gray-600 text-sm">Seller có {seller.products?.length || 0} sản phẩm</p>
                {/* TODO: Implement seller products view for public profile */}
              </div>
            )}

            {/* Quick Stats Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Thống kê</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Đơn hàng thành công</span>
                  <span className="font-semibold text-green-600">147</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Đánh giá trung bình</span>
                  <span className="font-semibold text-yellow-600">4.8/5.0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Thời gian phản hồi</span>
                  <span className="font-semibold text-blue-600">&lt; 2h</span>
                </div>
                {user.role === UserRole.SELLER && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Sản phẩm đang bán</span>
                    <span className="font-semibold text-purple-600">23</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
