"use client";
import React, { useState, useRef, useEffect } from 'react';
import LogoutButton from './LogoutButton';

interface UserMenuProps {
  user: {
    name?: string;
    avatar?: string;
    [key: string]: any;
  };
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

  return (
    <div className="relative" ref={ref}>
      <img
        src={user.avatar || '/default-avatar.jpg'}
        alt={user.name || 'User'}
        className="w-9 h-9 rounded-full object-cover border border-shop_light_green shadow cursor-pointer"
        onClick={() => setOpen((o) => !o)}
      />
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-50 animate-fade-in">
          <a href="/profile" className="block px-4 py-2 hover:bg-gray-100 text-darkColor">Thông tin cá nhân</a>
          <a href="/orders" className="block px-4 py-2 hover:bg-gray-100 text-darkColor">Đơn hàng</a>
          <LogoutButton />
        </div>
      )}
    </div>
  );
};

export default UserMenu;
