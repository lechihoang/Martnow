"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ProfileLayout from '@/components/profile/ProfileLayout';
import OrderHistory from '@/components/profile/OrderHistory';
import { Order, User } from '@/types/entities';
import useUser from '@/hooks/useUser';

const OrdersPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const userId = params?.id as string;
  const userData = useUser(); // Sử dụng hook useUser
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userData === null) {
      // User hook vẫn đang loading
      return;
    }
    
    if (userData === undefined || !userData) {
      // Không có user data, chuyển về login
      router.push('/login');
      return;
    }

    // Có user data, load orders
    fetchData();
  }, [userData, userId, router]);

  const fetchData = async () => {
    try {
      const { mockUser, mockOrders } = await import('@/lib/mockData');
      const currentUserData = userData || mockUser;
      setCurrentUser(currentUserData);

      // Nếu xem orders của chính mình
      if (userId === currentUserData.id.toString()) {
        setProfileUser(currentUserData);
        setOrders(mockOrders);
      } else {
        // Không cho phép xem orders của người khác (private)
        router.push(`/profile/${userId}`);
        return;
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProfileLayout 
        userRole={currentUser?.role || 'buyer'} 
        userId={userId} 
        isOwnProfile={true}
      >
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      </ProfileLayout>
    );
  }

  if (!profileUser || !currentUser) {
    return (
      <ProfileLayout 
        userRole="buyer" 
        userId={userId} 
        isOwnProfile={false}
      >
        <div className="text-center py-8">
          <p className="text-red-500">Không thể tải thông tin đơn hàng</p>
        </div>
      </ProfileLayout>
    );
  }

  const isOwnProfile = currentUser.id.toString() === userId;

  return (
    <ProfileLayout 
      userRole={profileUser.role} 
      userId={userId} 
      isOwnProfile={isOwnProfile}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            {profileUser.role === 'seller' ? 'Đơn hàng bán ra' : 'Đơn hàng của tôi'}
          </h1>
          <div className="text-sm text-gray-500">
            Tổng: {orders.length} đơn hàng
          </div>
        </div>

        <OrderHistory orders={orders} />
      </div>
    </ProfileLayout>
  );
};

export default OrdersPage;
