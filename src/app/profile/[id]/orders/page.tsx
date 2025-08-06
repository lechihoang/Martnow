"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ProfileLayout from '@/components/profile/ProfileLayout';
import OrderHistory from '@/components/profile/OrderHistory';
import { Order, User, OrderStatus, UserRole } from '@/types/entities';
import { sellerApi } from '@/lib/api';
import { SellerOrdersDto } from '@/types/dtos';
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userData.loading) {
      // User hook vẫn đang loading
      return;
    }
    
    if (userData.user === null) {
      // Không có user data, chuyển về login
      router.push('/login');
      return;
    }

    // Có user data, load orders
    fetchData();
  }, [userData.loading, userData.user, userId, router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { mockUser, mockOrders } = await import('@/lib/mockData');
      const currentUserResponse = userData.user || mockUser;
      
      // Convert UserResponseDto to User
      const currentUserData: User = {
        ...currentUserResponse,
        password: '',
        reviews: [],
        createdAt: currentUserResponse.createdAt || new Date(),
        updatedAt: currentUserResponse.updatedAt || new Date(),
      };
      
      setCurrentUser(currentUserData);

      // Nếu xem orders của chính mình
      if (userId === currentUserData.id?.toString()) {
        setProfileUser(currentUserData);
        
        // Lấy đơn hàng dựa trên role  
        if (currentUserData.role === 'seller' && (currentUserResponse as any)?.sellerInfo?.id) {
          // Seller: lấy đơn hàng đã bán từ API
          try {
            console.log('Fetching seller orders for seller ID:', (currentUserResponse as any).sellerInfo.id);
            const sellerOrdersData: SellerOrdersDto = await sellerApi.getSellerOrders((currentUserResponse as any).sellerInfo.id);
            console.log('Seller orders data:', sellerOrdersData);
            
            // Convert SellerOrdersDto to Order[]
            const sellerOrders: Order[] = sellerOrdersData.orders.map(orderData => ({
              id: orderData.orderId,
              buyerId: 0, // Không có buyerId trong response
              addressId: undefined,
              totalPrice: orderData.totalPrice,
              status: orderData.status as OrderStatus,
              note: '',
              createdAt: orderData.createdAt,
              updatedAt: orderData.createdAt,
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
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  reviews: []
                },
                orders: [],
                reviews: [],
                addresses: [],
                createdAt: new Date(),
                updatedAt: new Date()
              },
              items: orderData.items.map(item => ({
                id: 0,
                orderId: orderData.orderId,
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
                order: {} as any, // Circular reference
                product: {
                  id: item.productId,
                  name: item.productName,
                  description: '',
                  price: item.price,
                  stock: 0,
                  isAvailable: true,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  sellerId: 0,
                  categoryId: 0,
                  seller: {} as any,
                  category: {} as any,
                  images: [],
                  reviews: [],
                  orderItems: []
                },
                createdAt: new Date(),
                updatedAt: new Date()
              })),
              address: undefined
            }));
            
            console.log('Converted seller orders:', sellerOrders);
            setOrders(sellerOrders);
          } catch (apiError) {
            console.error('Error fetching seller orders from API:', apiError);
            setError('Không thể tải đơn hàng từ server. Hiển thị dữ liệu mẫu.');
            setOrders(mockOrders); // Fallback to mock data
          }
        } else {
          // Buyer: sử dụng mock data (chưa implement buyer API)
          console.log('Using mock data for buyer');
          setOrders(mockOrders);
        }
      } else {
        // Không cho phép xem orders của người khác (private)
        router.push(`/profile/${userId}`);
        return;
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Có lỗi xảy ra khi tải dữ liệu');
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
