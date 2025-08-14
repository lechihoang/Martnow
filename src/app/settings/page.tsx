"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ProfileLayout from '@/components/profile/ProfileLayout';
import UserInfo from '@/components/profile/UserInfo';
import SellerInfo from '@/components/profile/SellerInfo';
import { User, Seller } from '@/types/entities';
import { sellerApi } from '@/lib/api';
import useUser from '@/hooks/useUser';

const SettingsPage: React.FC = () => {
  const router = useRouter();
  const userData = useUser();
  
  const [user, setUser] = useState<User | null>(null);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userData.loading) {
      return;
    }
    
    if (userData.user === null) {
      // Chưa đăng nhập, chuyển về login
      router.push('/login');
      return;
    }

    // Có user data, load thông tin để chỉnh sửa
    fetchUserData();
  }, [userData.loading, userData.user?.id]);

  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

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
        password: '',
        reviews: [],
        buyer: undefined,
        seller: undefined,
      };

      setUser(userAsUser);
      
      // Nếu là seller, lấy thông tin seller để chỉnh sửa
      if (currentUserData.role === 'seller') {
        try {
          const sellerData = await sellerApi.getSellerByUserId(currentUserData.id);
          const sellerEntity = {
            ...sellerData,
            user: userAsUser,
            products: [],
            stats: undefined
          } as Seller;
          setSeller(sellerEntity);
        } catch (error) {
          console.error('Error fetching seller info:', error);
          // Nếu chưa có seller profile, set null để có thể tạo mới
          setSeller(null);
        }
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Không thể tải thông tin người dùng');
      setLoading(false);
    }
  }, [userData.user?.id]);

  const handleUpdateUser = async (updatedUser: Partial<User>) => {
    try {
      console.log('Updating user:', updatedUser);
      if (user) {
        // Gọi API để update user
        // const updatedUserData = await userApi.updateUser(user.id, updatedUser);
        setUser({ ...user, ...updatedUser });
        alert('Cập nhật thông tin thành công!');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Có lỗi xảy ra khi cập nhật thông tin!');
    }
  };

  const handleUpdateSeller = async (updatedSeller: Partial<Seller>) => {
    try {
      console.log('Updating seller:', updatedSeller);
      if (seller) {
        // Gọi API để update seller
        // const updatedSellerData = await sellerApi.updateSeller(seller.id, updatedSeller);
        setSeller({ ...seller, ...updatedSeller });
        alert('Cập nhật thông tin cửa hàng thành công!');
      }
    } catch (error) {
      console.error('Error updating seller:', error);
      alert('Có lỗi xảy ra khi cập nhật thông tin cửa hàng!');
    }
  };

  const handleCreateSeller = async (sellerData: Partial<Seller>) => {
    try {
      if (!user) return;
      
      console.log('Creating seller profile:', sellerData);
      // Gọi API để tạo seller profile
      // const newSeller = await sellerApi.createSeller({
      //   userId: user.id,
      //   ...sellerData
      // });
      // setSeller(newSeller);
      alert('Tạo hồ sơ bán hàng thành công!');
    } catch (error) {
      console.error('Error creating seller:', error);
      alert('Có lỗi xảy ra khi tạo hồ sơ bán hàng!');
    }
  };

  if (loading) {
    return (
      <ProfileLayout 
        userRole="buyer" 
        userId={userData.user?.id?.toString() || ''} 
        isOwnProfile={true}
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
        userId={userData.user?.id?.toString() || ''} 
        isOwnProfile={true}
      >
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
      userId={user.id.toString()} 
      isOwnProfile={true}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">
            Cài đặt tài khoản
          </h1>
          <button
            onClick={() => router.push(`/profile/${user.id}`)}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Xem hồ sơ
          </button>
        </div>

        {/* Form chỉnh sửa thông tin cơ bản */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Thông tin cá nhân</h2>
          <UserInfo 
            user={user} 
            onUpdate={handleUpdateUser}
            readOnly={false} // Có thể chỉnh sửa
          />
        </div>
        
        {/* Form chỉnh sửa thông tin cửa hàng */}
        {user.role === 'seller' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Thông tin cửa hàng</h2>
            {seller ? (
              <SellerInfo 
                seller={seller} 
                onUpdate={handleUpdateSeller}
                readOnly={false} // Có thể chỉnh sửa
              />
            ) : (
              <div className="text-center py-8">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Bạn chưa có hồ sơ bán hàng
                </h3>
                <p className="text-gray-500 mb-4">
                  Tạo hồ sơ bán hàng để bắt đầu bán sản phẩm
                </p>
                <button
                  onClick={() => handleCreateSeller({})}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Tạo hồ sơ bán hàng
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </ProfileLayout>
  );
};

export default SettingsPage;
