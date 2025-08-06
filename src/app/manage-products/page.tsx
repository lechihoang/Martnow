"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Container from '@/components/Container';
import SellerProducts from '@/components/profile/SellerProducts';
import SellerStats from '@/components/profile/SellerStats';
import { Product, Stats } from '@/types/entities';
import useUser from '@/hooks/useUser';

const ManageProductsPage: React.FC = () => {
  const router = useRouter();
  const userData = useUser(); // Sử dụng hook useUser
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

    // Kiểm tra quyền seller
    if (userData.user?.role !== 'seller') {
      router.push('/');
      return;
    }

    // Có user data và là seller, load products
    fetchData();
  }, [userData, router]);

  const fetchData = async () => {
    try {
      // Import mock data
      const { mockProducts, mockStats } = await import('@/lib/mockData');

      setProducts(mockProducts);
      setStats(mockStats);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleEditProduct = (product: Product) => {
    // Chuyển đến trang chỉnh sửa sản phẩm
    router.push(`/product/edit/${product.id}`);
  };

  const handleDeleteProduct = async (productId: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      try {
        // API call để xóa sản phẩm
        console.log('Deleting product:', productId);
        setProducts(products.filter(p => p.id !== productId));
        
        // Cập nhật lại stats
        setStats((prev: Stats) => ({
          ...prev,
          totalProducts: prev.totalProducts - 1
        }));
      } catch (error) {
        console.error('Error deleting product:', error);
      }
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

  return (
    <Container>
      <div className="py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý sản phẩm</h1>
          <button
            onClick={() => router.push('/add')}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
          >
            Thêm sản phẩm mới
          </button>
        </div>
        
        <div className="space-y-6">
          {/* Thống kê */}
          <SellerStats stats={stats} />
          
          {/* Danh sách sản phẩm */}
          <SellerProducts 
            products={products}
            onEditProduct={handleEditProduct}
            onDeleteProduct={handleDeleteProduct}
          />
        </div>
      </div>
    </Container>
  );
};

export default ManageProductsPage;
