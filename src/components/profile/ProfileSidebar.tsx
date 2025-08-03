"use client";
import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface ProfileSidebarProps {
  userRole: string;
  userId: string;
  isOwnProfile: boolean;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ userRole, userId, isOwnProfile }) => {
  const pathname = usePathname();

  const commonMenuItems = [
    {
      href: `/profile/${userId}`,
      label: 'Thông tin cá nhân',
      icon: '👤',
      description: 'Xem và chỉnh sửa thông tin cá nhân'
    },
    {
      href: `/profile/${userId}/orders`,
      label: 'Đơn hàng',
      icon: '📦',
      description: 'Lịch sử đơn hàng và theo dõi'
    }
  ];

  const sellerMenuItems = [
    {
      href: `/profile/${userId}/shop`,
      label: 'Cửa hàng',
      icon: '🏪',
      description: 'Thông tin và cài đặt cửa hàng'
    },
    {
      href: `/profile/${userId}/products`,
      label: 'Sản phẩm',
      icon: '🛍️',
      description: 'Quản lý danh sách sản phẩm'
    },
    {
      href: `/profile/${userId}/order-management`,
      label: 'Quản lý đơn hàng',
      icon: '📋',
      description: 'Xử lý và theo dõi đơn hàng'
    },
    {
      href: `/profile/${userId}/analytics`,
      label: 'Thống kê',
      icon: '📊',
      description: 'Doanh thu và báo cáo'
    },
    {
      href: `/profile/${userId}/reviews`,
      label: 'Đánh giá',
      icon: '⭐',
      description: 'Quản lý đánh giá và phản hồi'
    }
  ];

  const buyerMenuItems = [
    {
      href: `/profile/${userId}/wishlist`,
      label: 'Yêu thích',
      icon: '❤️',
      description: 'Danh sách sản phẩm yêu thích'
    },
    {
      href: `/profile/${userId}/addresses`,
      label: 'Địa chỉ',
      icon: '📍',
      description: 'Quản lý địa chỉ giao hàng'
    }
  ];

  const getMenuItems = () => {
    let items = [...commonMenuItems];
    
    if (userRole === 'seller' && isOwnProfile) {
      items = [...items, ...sellerMenuItems];
    } else if (userRole === 'buyer' && isOwnProfile) {
      items = [...items, ...buyerMenuItems];
    }
    
    return items;
  };

  const isActive = (href: string) => {
    if (!pathname) return false;
    
    if (href === `/profile/${userId}`) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {isOwnProfile ? 'Tài khoản của tôi' : 'Thông tin người dùng'}
        </h3>
        <p className="text-sm text-gray-500 mb-6 capitalize">
          {userRole === 'seller' ? 'Người bán' : 'Khách hàng'}
        </p>
        
        <nav className="space-y-2">
          {getMenuItems().map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-start p-3 rounded-lg transition-colors group ${
                isActive(item.href)
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="text-lg mr-3 mt-0.5">{item.icon}</span>
              <div className="flex-1">
                <div className={`font-medium text-sm ${
                  isActive(item.href) ? 'text-blue-700' : 'text-gray-900'
                }`}>
                  {item.label}
                </div>
                <div className={`text-xs mt-0.5 ${
                  isActive(item.href) ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {item.description}
                </div>
              </div>
              {isActive(item.href) && (
                <div className="w-1 h-6 bg-blue-500 rounded-full ml-2"></div>
              )}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default ProfileSidebar;
