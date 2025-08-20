"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ProfileLayout from '@/components/profile/ProfileLayout';
import OrderHistory from '@/components/profile/OrderHistory';
import { Order, User, OrderStatus, UserRole } from '@/types/entities';
import { sellerApi } from '@/lib/api';
import { SellerOrdersDto, UserResponseDto } from '@/types/dtos';
import useUser from '@/hooks/useUser';

const SalesHistoryPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const userId = params?.id as string;
  const userData = useUser();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const currentUserResponse = userData.user;
      
      if (!currentUserResponse) {
        setError('Không thể tải thông tin người dùng. Vui lòng đăng nhập lại.');
        setLoading(false);
        return;
      }
      
      // Convert UserResponseDto to User
      const currentUserData: User = {
        ...currentUserResponse,
        password: '',
        reviews: [],
        buyer: undefined,
        seller: undefined,
      };
      
      setCurrentUser(currentUserData);

      // Kiểm tra quyền truy cập - chỉ seller mới được xem sales history
      if (currentUserData.role !== 'seller') {
        setError('Chỉ người bán mới có thể truy cập lịch sử bán hàng.');
        setLoading(false);
        return;
      }

      // Nếu xem sales history của chính mình
      if (userId === currentUserData.id?.toString()) {
        setProfileUser(currentUserData);
        
        // Kiểm tra xem có seller không
        const sellerInfo = (currentUserResponse as UserResponseDto)?.seller;
        
        if (!sellerInfo?.id) {
          setError('Bạn chưa có thông tin shop. Vui lòng tạo shop trước khi xem lịch sử bán hàng.');
          setOrders([]);
          setLoading(false);
          return;
        }

        // Seller: lấy đơn hàng đã bán từ API
        try {
          console.log('Fetching seller orders for seller ID:', sellerInfo.id);
          const sellerOrdersData: SellerOrdersDto = await sellerApi.getSellerOrders(sellerInfo.id);
          console.log('Seller orders data:', sellerOrdersData);
          
          // Convert SellerOrdersDto to Order[]
          const sellerOrders: Order[] = sellerOrdersData.orders.map(orderData => ({
            id: orderData.id,
            buyerId: 0,
            addressId: undefined,
            totalPrice: orderData.totalPrice,
            status: orderData.status as OrderStatus,
            note: '',
            createdAt: new Date(orderData.createdAt),
            updatedAt: new Date(orderData.createdAt),
            buyer: {
              id: 0,
              userId: 0,
              user: {
                id: 0,
                name: orderData.buyerName,
                username: '',
                email: '',
                role: UserRole.BUYER,
                password: '',
                avatar: '',
                reviews: []
              },
              orders: [],
              reviews: [],
              addresses: []
            },
            items: [] as Order['items'], // Fix the 'any' type
            address: undefined
          }));
          
          console.log('Converted seller orders:', sellerOrders);
          setOrders(sellerOrders);
        } catch (apiError) {
          console.error('Error fetching seller orders from API:', apiError);
          setError('Không thể tải lịch sử bán hàng từ server. Vui lòng thử lại sau.');
          setOrders([]);
        }
      } else {
        // Không cho phép xem sales history của người khác (private)
        router.push(`/profile/${userId}`);
        return;
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Có lỗi xảy ra khi tải dữ liệu');
      setLoading(false);
    }
  }, [userData.user, userId, router]);

  useEffect(() => {
    if (userData.loading) {
      return;
    }
    
    if (userData.user === null) {
      router.push('/login');
      return;
    }

    fetchData();
  }, [userData.loading, userData.user, userId, router, fetchData]);

  if (loading) {
    return (
      <ProfileLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      </ProfileLayout>
    );
  }

  if (!profileUser || !currentUser) {
    return (
      <ProfileLayout>
        <div className="text-center py-8">
          <p className="text-red-500">Không thể tải lịch sử bán hàng</p>
        </div>
      </ProfileLayout>
    );
  }

  return (
    <ProfileLayout>
      <div className="space-y-6">
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-yellow-400">⚠️</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-800">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Lịch sử bán hàng
            </h1>
            <p className="text-gray-600 mt-1">
              Theo dõi tất cả các đơn hàng khách hàng đã mua từ shop của bạn
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">
              Tổng: {orders.length} đơn hàng
            </div>
            {orders.length > 0 && (
              <div className="text-xs text-gray-400 mt-1">
                Tổng doanh thu: {orders.reduce((total, order) => total + order.totalPrice, 0).toLocaleString('vi-VN')} ₫
              </div>
            )}
          </div>
        </div>

        <OrderHistory orders={orders} userRole={profileUser.role as 'buyer' | 'seller'} />
      </div>
    </ProfileLayout>
  );
};

export default SalesHistoryPage;
