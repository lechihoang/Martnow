'use client';

import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, User, Settings, LogOut, ShoppingCart, Heart } from 'lucide-react';
import { UserProfile } from '@/types/auth';
import { useAuth } from '@/hooks/useAuth';
import useStore from '@/stores/store';

interface UserAvatarProps {
  userProfile: UserProfile;
}

export function UserAvatar({ userProfile }: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { signout } = useAuth();
  const { clearCart } = useStore();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!userProfile) {
    return null;
  }

  // Hiển thị tên người dùng từ userProfile
  const displayName = userProfile?.name || userProfile?.username || 'User';

  // Xử lý avatar URL
  const avatarUrl = imageError ? '/default-avatar.jpg' : (userProfile?.avatar || '/default-avatar.jpg');

  const handleLogout = async () => {
    try {
      await clearCart();
      await signout();
      setIsDropdownOpen(false);
      router.push('/');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Button */}
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="User menu"
      >
        <div className="relative h-8 w-8">
          <Image
            src={avatarUrl}
            alt={displayName}
            fill
            className="rounded-full object-cover"
            onError={() => setImageError(true)}
          />
        </div>
        <span className="text-sm font-medium text-gray-700">
          {displayName}
        </span>
        <ChevronDown 
          className={`w-4 h-4 text-gray-500 transition-transform ${
            isDropdownOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">{displayName}</p>
            <p className="text-xs text-gray-500">{userProfile.email}</p>
            <span className="inline-block mt-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
              {userProfile?.role || 'BUYER'}
            </span>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button
              onClick={() => {
                setIsDropdownOpen(false);
                router.push('/account');
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <User className="w-4 h-4 mr-3" />
              Quản lý tài khoản
            </button>

            {/* Conditional Menu Items based on Role */}
            {userProfile?.role === 'SELLER' ? (
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  router.push('/shop-dashboard');
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Settings className="w-4 h-4 mr-3" />
                Quản lý cửa hàng
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    router.push('/orders');
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <ShoppingCart className="w-4 h-4 mr-3" />
                  Đơn hàng của tôi
                </button>

                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    router.push('/favorites');
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Heart className="w-4 h-4 mr-3" />
                  Sản phẩm yêu thích
                </button>
              </>
            )}

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
