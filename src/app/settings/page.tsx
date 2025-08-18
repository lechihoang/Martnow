"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import UserInfo from '@/components/profile/UserInfo';
import SellerInfo from '@/components/profile/SellerInfo';
import { User, Seller, UserRole } from '@/types/entities';
import { sellerApi } from '@/lib/api';
import useUser from '@/hooks/useUser';
import { Settings, User as UserIcon, Store, Lock, Bell, Eye } from 'lucide-react';

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

  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Thông tin cá nhân', icon: UserIcon },
    { id: 'shop', label: 'Cửa hàng', icon: Store, show: user?.role === UserRole.SELLER },
    { id: 'security', label: 'Bảo mật', icon: Lock },
    { id: 'notifications', label: 'Thông báo', icon: Bell },
    { id: 'privacy', label: 'Quyền riêng tư', icon: Eye }
  ].filter(tab => tab.show !== false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
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
        <div className="max-w-6xl mx-auto">
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
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              ← Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
              >
                ← Quay lại
              </button>
              <div className="w-px h-6 bg-gray-300"></div>
              <div className="flex items-center gap-3">
                <Settings className="w-8 h-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">Cài đặt tài khoản</h1>
              </div>
            </div>
            
            <button
              onClick={() => router.push(`/profile/${user.id}`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              👁️ Xem hồ sơ công khai
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="flex gap-6">
          {/* Sidebar Navigation */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-lg p-4">
              <div className="space-y-2">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            {activeTab === 'profile' && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-center gap-3 mb-6">
                  <UserIcon className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Thông tin cá nhân</h2>
                </div>
                <UserInfo 
                  user={user} 
                  onUpdate={handleUpdateUser}
                  readOnly={false}
                />
              </div>
            )}

            {activeTab === 'shop' && user.role === UserRole.SELLER && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Store className="w-6 h-6 text-green-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Thông tin cửa hàng</h2>
                </div>
                {seller ? (
                  <SellerInfo 
                    seller={seller} 
                    onUpdate={handleUpdateSeller}
                    readOnly={false}
                  />
                ) : (
                  <div className="text-center py-12">
                    <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Bạn chưa có cửa hàng
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Tạo cửa hàng để bắt đầu bán sản phẩm của bạn
                    </p>
                    <button
                      onClick={() => handleCreateSeller({})}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
                    >
                      🏢 Tạo cửa hàng
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'security' && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Lock className="w-6 h-6 text-red-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Bảo mật tài khoản</h2>
                </div>
                <div className="space-y-6">
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Đổi mật khẩu</h3>
                    <p className="text-gray-600 mb-4">Cập nhật mật khẩu để bảo vệ tài khoản của bạn</p>
                    <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                      Đổi mật khẩu
                    </button>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Xác thực 2 yếu tố (2FA)</h3>
                    <p className="text-gray-600 mb-4">Tăng cường bảo mật với xác thực 2 yếu tố</p>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Bật 2FA
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Bell className="w-6 h-6 text-yellow-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Cài đặt thông báo</h2>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'Đơn hàng mới', description: 'Nhận thông báo khi có đơn hàng mới' },
                    { label: 'Tin nhắn', description: 'Nhận thông báo tin nhắn mới' },
                    { label: 'Đánh giá', description: 'Thông báo khi có đánh giá mới' },
                    { label: 'Khuyến mãi', description: 'Nhận thông báo về khuyến mãi, giảm giá' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{item.label}</h4>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Eye className="w-6 h-6 text-purple-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Quyền riêng tư</h2>
                </div>
                <div className="space-y-6">
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Hiển thị thông tin</h3>
                    <p className="text-gray-600 mb-4">Quản lý thông tin nào có thể nhìn thấy công khai</p>
                    <div className="space-y-3">
                      {[
                        'Email',
                        'Số điện thoại',
                        'Địa chỉ',
                        'Hoạt động gần đây'
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-gray-700">{item}</span>
                          <select className="px-3 py-1 border border-gray-300 rounded">
                            <option>Công khai</option>
                            <option>Chỉ bạn bè</option>
                            <option>Riêng tư</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
