"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ProfileLayout from '@/components/profile/ProfileLayout';
import UserInfo from '@/components/profile/UserInfo';
import SellerInfo from '@/components/profile/SellerInfo';
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
      <ProfileLayout 
        userRole="buyer" 
        userId={userId} 
        isOwnProfile={false}
      >
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      </ProfileLayout>
    );
  }

  if (error || !user) {
    return (
      <ProfileLayout 
        userRole="buyer" 
        userId={userId} 
        isOwnProfile={false}
      >
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
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Quay lại
          </button>
        </div>
      </ProfileLayout>
    );
  }

  return (
    <ProfileLayout 
      userRole={user.role} 
      userId={userId} 
      isOwnProfile={isOwnProfile}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">
            {isOwnProfile ? 'Thông tin cá nhân' : `Thông tin của ${user.name}`}
          </h1>
          <div className="flex gap-3">
            {isOwnProfile ? (
              // Nút chỉnh sửa cho chính mình - chuyển đến settings
              <button 
                onClick={() => router.push('/settings')}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Chỉnh sửa thông tin
              </button>
            ) : (
              // Nút action cho người khác
              <>
                <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                  Nhắn tin
                </button>
                {user.role === 'seller' && (
                  <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
                    Xem cửa hàng
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Thông tin cơ bản - CHỈ XEM */}
        <UserInfo 
          user={user} 
          onUpdate={() => {}} // Không có update function
          readOnly={true} // Luôn readOnly
        />
        
        {/* Nếu là seller, hiển thị thông tin cửa hàng - CHỈ XEM */}
        {user.role === 'seller' && seller && (
          <SellerInfo 
            seller={seller} 
            onUpdate={() => {}} // Không có update function
            readOnly={true} // Luôn readOnly
          />
        )}
      </div>
    </ProfileLayout>
  );
};

export default ProfilePage;
