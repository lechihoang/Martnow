"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, MapPin, Phone, Mail, Calendar, Store, Package } from 'lucide-react';

import { UserResponseDto, SellerResponseDto, ProductResponseDto } from '@/types/dtos';
import { userApi, productApi, getUserProfile } from '@/lib/api';
import { useAuthContext } from '@/contexts/AuthContext';
import ProductCard from '@/components/ProductCard';
import { UserProfile } from '@/types/auth';
import { LoadingSpinner } from '@/components/ui';

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const userId = params?.id as string;
  const { user: currentUser } = useAuthContext();

  const [profileData, setProfileData] = useState<{
    user: UserResponseDto;
    seller?: SellerResponseDto;
  } | null>(null);
  const [products, setProducts] = useState<ProductResponseDto[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);

  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await userApi.getProfileById(userId);
      const userData = response?.data as unknown as UserResponseDto;

      if (!userData || !userData.id) {
        setError('Không tìm thấy thông tin người dùng');
        setLoading(false);
        return;
      }

      setProfileData({
        user: userData,
        seller: userData.sellerInfo ? {
          id: userData.id, // seller.id is same as user.id
          shopName: userData.sellerInfo.shopName,
          description: userData.sellerInfo.description,
          totalProducts: 0,
          user: {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            address: userData.address,
            phone: userData.phone,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        } as SellerResponseDto : undefined,
      });
      setLoading(false);
    } catch (error) {
      console.error('❌ Error fetching profile data:', error);
      setError('Không thể tải thông tin người dùng');
      setLoading(false);
    }
  }, [userId]);

  const fetchProducts = useCallback(async () => {
    if (!userId || !profileData?.user || profileData.user.role !== 'SELLER') {
      return;
    }

    try {
      setLoadingProducts(true);
      const sellerProducts = await productApi.getProductsBySellerId(userId);
      // Get top 8 products (featured products)
      setProducts(sellerProducts.slice(0, 8));
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  }, [userId, profileData?.user]);

  useEffect(() => {
    if (!userId) {
      router.push('/');
      return;
    }
    fetchUserData();
  }, [userId, router, fetchUserData]);

  useEffect(() => {
    if (profileData?.user && profileData.user.role === 'SELLER') {
      fetchProducts();
    }
  }, [profileData?.user, fetchProducts]);

  useEffect(() => {
    if (currentUser) {
      getUserProfile()
        .then(profile => {
          if (profile) {
            setCurrentUserProfile(profile);
          }
        })
        .catch(err => console.error('Error fetching current user profile:', err));
    }
  }, [currentUser]);

  const profileUser = profileData?.user;
  const sellerData = profileData?.seller;

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-6xl mx-auto">
          <LoadingSpinner size="xl" message="Đang tải thông tin người dùng..." />
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-6xl mx-auto">
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
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors"
            >
              ← Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="p-8">
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <Image
                  key={profileUser?.avatar || 'default'}
                  src={profileUser?.avatar || '/default-avatar.jpg'}
                  alt={profileUser?.name || 'User'}
                  width={120}
                  height={120}
                  className="w-30 h-30 rounded-full object-cover border-4 border-gray-100 shadow-lg"
                  unoptimized
                />
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {profileUser?.name|| 'Người dùng'}
                    </h1>
                    <div className="flex items-center gap-2 text-gray-600 mb-3">
                      <span>@{profileUser?.name}</span>
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                        profileUser?.role === 'SELLER'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {profileUser?.role === 'SELLER' ? 'Người bán' : 'Khách hàng'}
                      </span>
                    </div>

                    {sellerData?.shopName && (
                      <div className="flex items-center gap-2 text-gray-700 mb-2">
                        <Store className="w-5 h-5 text-gray-500" />
                        <span className="font-medium">{sellerData.shopName}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      Tham gia {new Date(profileUser?.createdAt || '').toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Thông tin liên hệ</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <div className="text-sm text-gray-500 mb-1">Email</div>
                <div className="text-gray-900">{profileUser?.email || 'Chưa cập nhật'}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <div className="text-sm text-gray-500 mb-1">Số điện thoại</div>
                <div className="text-gray-900">{profileUser?.phone || 'Chưa cập nhật'}</div>
              </div>
            </div>

            <div className="flex items-start gap-3 md:col-span-2">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <div className="text-sm text-gray-500 mb-1">Địa chỉ</div>
                <div className="text-gray-900">{profileUser?.address || 'Chưa cập nhật'}</div>
              </div>
            </div>

            {sellerData?.description && (
              <div className="md:col-span-2">
                <div className="text-sm text-gray-500 mb-2">Giới thiệu</div>
                <div className="text-gray-900">{sellerData.description}</div>
              </div>
            )}
          </div>
        </div>

        {/* Featured Products Section - Only for Sellers */}
        {profileUser?.role === 'SELLER' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Sản phẩm nổi bật</h2>
              {products.length > 0 && (
                <button
                  onClick={() => router.push(`/shop/${userId}`)}
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Xem tất cả →
                </button>
              )}
            </div>

            {loadingProducts ? (
              <div className="py-12">
                <LoadingSpinner size="lg" message="Đang tải sản phẩm..." className="min-h-[300px]" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Package className="w-16 h-16 mx-auto mb-3 text-gray-300" />
                <p className="text-lg font-medium text-gray-700 mb-1">Chưa có sản phẩm</p>
                <p className="text-sm text-gray-500">Người bán chưa đăng sản phẩm nào</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    user={currentUser}
                    userProfile={currentUserProfile}
                    loading={false}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
