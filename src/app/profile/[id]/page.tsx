"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ProfileLayout from '@/components/profile/ProfileLayout';
import UserInfo from '@/components/profile/UserInfo';
import SellerInfo from '@/components/profile/SellerInfo';
import { User, Seller } from '@/types/entities';

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const userId = params?.id as string;
  
  if (!userId) {
    router.push('/');
    return null;
  }
  
  const [user, setUser] = useState<User | null>(null);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Lấy thông tin user hiện tại từ token/localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Giả lập lấy current user
      const { mockUser } = await import('@/lib/mockData');
      setCurrentUser(mockUser);

      // Nếu xem profile của chính mình
      if (userId === mockUser.id.toString()) {
        setUser(mockUser);
        
        if (mockUser.role === 'seller') {
          const { mockSeller } = await import('@/lib/mockData');
          setSeller(mockSeller);
        }
      } else {
        // Lấy thông tin user khác qua API
        // Giả lập API call
        const otherUser: User = {
          id: parseInt(userId),
          name: 'Nguyễn Thị B',
          username: 'nguyenthib',
          email: 'nguyenthib@example.com',
          role: 'buyer',
          password: '',
          avatar: '/default-avatar.jpg'
        };
        setUser(otherUser);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Không thể tải thông tin người dùng');
      setLoading(false);
    }
  };

  const handleUpdateUser = async (updatedUser: Partial<User>) => {
    try {
      // Chỉ cho phép cập nhật profile của chính mình
      if (!isOwnProfile) return;
      
      console.log('Updating user:', updatedUser);
      if (user) {
        setUser({ ...user, ...updatedUser });
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleUpdateSeller = async (updatedSeller: Partial<Seller>) => {
    try {
      if (!isOwnProfile) return;
      
      console.log('Updating seller:', updatedSeller);
      if (seller) {
        setSeller({ ...seller, ...updatedSeller });
      }
    } catch (error) {
      console.error('Error updating seller:', error);
    }
  };

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

  const isOwnProfile = currentUser?.id.toString() === userId;

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
          {!isOwnProfile && (
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                Nhắn tin
              </button>
              {user.role === 'seller' && (
                <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
                  Xem cửa hàng
                </button>
              )}
            </div>
          )}
        </div>

        {/* Thông tin cơ bản */}
        <UserInfo 
          user={user} 
          onUpdate={handleUpdateUser}
          readOnly={!isOwnProfile}
        />
        
        {/* Nếu là seller, hiển thị thông tin cửa hàng */}
        {user.role === 'seller' && seller && (
          <SellerInfo 
            seller={seller} 
            onUpdate={handleUpdateSeller}
            readOnly={!isOwnProfile}
          />
        )}
      </div>
    </ProfileLayout>
  );
};

export default ProfilePage;
