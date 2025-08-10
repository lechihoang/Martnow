"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Container from '@/components/Container';
import UserInfo from '@/components/profile/UserInfo';
import SellerInfo from '@/components/profile/SellerInfo';
import OrderHistory from '@/components/profile/OrderHistory';
import SellerProducts from '@/components/profile/SellerProducts';
import SellerStats from '@/components/profile/SellerStats';
import { User, Seller, Order, Product, Stats } from '@/types/entities';
import useUser from '@/hooks/useUser';

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const userData = useUser(); // Sử dụng hook useUser
  const [user, setUser] = useState<User | null>(null);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    pendingOrders: 0,
    completedOrders: 0,
    averageRating: 0,
    totalReviews: 0
  });
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

    // Có user data, load profile
    fetchUserData();
  }, [userData, router]);

  const fetchUserData = async () => {
    try {
      // Import mock data
      const {
        mockUser,
        mockSeller,
        mockProducts,
        mockStats,
        mockOrders
      } = await import('@/lib/mockData');

      // Sử dụng dữ liệu từ useUser hook hoặc mock data
      const currentUser = userData.user || mockUser;
      
      // Convert to User entity if needed
      const userEntity: User = {
        ...currentUser,
        password: '',
        reviews: [],
        createdAt: currentUser.createdAt || new Date(),
        updatedAt: currentUser.updatedAt || new Date(),
        buyer: undefined,
        seller: undefined,
      };
      
      setUser(userEntity);

      if (currentUser.role === 'seller') {
        setSeller(mockSeller);
        setProducts(mockProducts);
        setStats(mockStats);
      }

      setOrders(mockOrders);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setLoading(false);
    }
  };

  const handleUpdateUser = async (updatedUser: Partial<User>) => {
    try {
      // API call để cập nhật thông tin user
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
      // API call để cập nhật thông tin seller
      console.log('Updating seller:', updatedSeller);
      if (seller) {
        setSeller({ ...seller, ...updatedSeller });
      }
    } catch (error) {
      console.error('Error updating seller:', error);
    }
  };

  const handleEditProduct = (product: Product) => {
    // Chuyển đến trang chỉnh sửa sản phẩm
    router.push(`/product/edit/${product.id}`);
  };

  const handleDeleteProduct = async (productId: number) => {
    try {
      // API call để xóa sản phẩm
      console.log('Deleting product:', productId);
      setProducts(products.filter(p => p.id !== productId));
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  if (loading) {
    return (
      <Container>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container>
        <div className="text-center py-8">
          <p className="text-red-500">Không thể tải thông tin người dùng</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Thông tin cá nhân</h1>
        
        <div className="space-y-6">
          {/* Thông tin cơ bản của user */}
          <UserInfo user={user} onUpdate={handleUpdateUser} />
          
          {/* Nếu là seller, hiển thị thông tin cửa hàng */}
          {user.role === 'seller' && seller && (
            <>
              <SellerInfo seller={seller} onUpdate={handleUpdateSeller} />
              <SellerStats stats={stats} />
              <SellerProducts 
                products={products}
                onEditProduct={handleEditProduct}
                onDeleteProduct={handleDeleteProduct}
              />
            </>
          )}
          
          {/* Lịch sử đơn hàng */}
          <OrderHistory orders={orders} />
        </div>
      </div>
    </Container>
  );
};

export default ProfilePage;
