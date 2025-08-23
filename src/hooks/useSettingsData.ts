import { useState, useEffect, useCallback } from 'react';
import { User, Seller, UserRole } from '@/types/entities';
import { sellerApi } from '@/lib/api';
import useUser from '@/hooks/useUser';

interface UseSettingsDataReturn {
  user: User | null;
  seller: Seller | null;
  loading: boolean;
  error: string | null;
  handleUpdateUser: (updatedUser: Partial<User>) => Promise<void>;
  handleUpdateSeller: (updatedSeller: Partial<Seller>) => Promise<void>;
  handleCreateSeller: (sellerData: Partial<Seller>) => Promise<void>;
  refetchData: () => Promise<void>;
}

export const useSettingsData = (): UseSettingsDataReturn => {
  const userData = useUser();
  const [user, setUser] = useState<User | null>(null);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!userData.user) {
        setError('Không thể lấy thông tin người dùng');
        setLoading(false);
        return;
      }

      // Convert UserResponseDto to User
      const userAsUser: User = {
        ...userData.user,
        password: '',
        reviews: [],
        buyer: undefined,
        seller: undefined,
      };

      setUser(userAsUser);

      // Fetch seller info if user is a seller
      if (userData.user.role === UserRole.SELLER) {
        try {
          const sellerData = await sellerApi.getSellerByUserId(userData.user.id);
          const sellerEntity = {
            ...sellerData,
            user: userAsUser,
            products: [],
            stats: undefined
          } as Seller;
          setSeller(sellerEntity);
        } catch (error) {
          console.error('Error fetching seller info:', error);
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

  useEffect(() => {
    if (userData.loading) return;
    
    if (userData.user === null) {
      setError('Người dùng chưa đăng nhập');
      setLoading(false);
      return;
    }

    fetchUserData();
  }, [userData.loading, userData.user?.id, fetchUserData]);

  const handleUpdateUser = useCallback(async (updatedUser: Partial<User>) => {
    try {
      console.log('Updating user:', updatedUser);
      if (user) {
        // TODO: Call API to update user
        // const updatedUserData = await userApi.updateUser(user.id, updatedUser);
        setUser({ ...user, ...updatedUser });
        // You can use toast notification instead of alert
        alert('Cập nhật thông tin thành công!');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Có lỗi xảy ra khi cập nhật thông tin!');
    }
  }, [user]);

  const handleUpdateSeller = useCallback(async (updatedSeller: Partial<Seller>) => {
    try {
      console.log('Updating seller:', updatedSeller);
      if (seller) {
        // TODO: Call API to update seller
        // const updatedSellerData = await sellerApi.updateSeller(seller.id, updatedSeller);
        setSeller({ ...seller, ...updatedSeller });
        alert('Cập nhật thông tin cửa hàng thành công!');
      }
    } catch (error) {
      console.error('Error updating seller:', error);
      alert('Có lỗi xảy ra khi cập nhật thông tin cửa hàng!');
    }
  }, [seller]);

  const handleCreateSeller = useCallback(async (sellerData: Partial<Seller>) => {
    try {
      if (!user) return;
      
      console.log('Creating seller profile:', sellerData);
      // TODO: Call API to create seller profile
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
  }, [user]);

  return {
    user,
    seller,
    loading,
    error,
    handleUpdateUser,
    handleUpdateSeller,
    handleCreateSeller,
    refetchData: fetchUserData,
  };
};
