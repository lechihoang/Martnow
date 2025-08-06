"use client";
import React, { useState, useRef, useEffect } from 'react';
import LogoutButton from './LogoutButton';
import { UserResponseDto } from '@/types/dtos';

interface UserMenuProps {
  user: UserResponseDto;
}

const UserMenu: React.FC<UserMenuProps> = ({ user }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getMenuItems = () => {
    const commonItems = [
      { href: `/profile/${user.id}`, label: "Thông tin cá nhân", icon: "👤" },
      { href: "/settings", label: "Cài đặt tài khoản", icon: "⚙️" },
      { href: `/profile/${user.id}/orders`, label: "Đơn hàng", icon: "📦" }
    ];

    if (user.role === 'seller') {
      return [
        ...commonItems,
        { href: `/profile/${user.id}/products`, label: "Quản lý sản phẩm", icon: "🛍️" },
        { href: `/profile/${user.id}/order-management`, label: "Quản lý đơn hàng", icon: "📋" },
        { href: `/profile/${user.id}/analytics`, label: "Thống kê", icon: "📊" },
        { href: "/add", label: "Thêm sản phẩm", icon: "➕" }
      ];
    }

    return commonItems;
  };

  return (
    <div className="relative" ref={ref}>
      <div 
        className="flex items-center cursor-pointer p-1 rounded-full hover:bg-gray-100 transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        <img
          src={user.avatar || '/default-avatar.jpg'}
          alt={user.name || 'User'}
          className="w-9 h-9 rounded-full object-cover border border-shop_light_green shadow"
        />
        <div className="ml-2 hidden md:block">
          <p className="text-sm font-medium text-gray-900">{user.name}</p>
          <p className="text-xs text-gray-500 capitalize">{user.role || 'user'}</p>
        </div>
      </div>
      
      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg z-50 animate-fade-in overflow-hidden">
          <div className="px-4 py-3 border-b bg-gray-50">
            <p className="text-sm font-medium text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
          
          <div className="py-1">
            {getMenuItems().map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </a>
            ))}
          </div>
          
          <div className="border-t py-1">
            <LogoutButton />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
