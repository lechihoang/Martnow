import React from 'react';
import { User } from '@supabase/supabase-js';
import useStore from '@/stores/store';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, Heart, User as UserIcon, LogOut, Menu, X } from 'lucide-react';
import { useOutsideClick } from '@/hooks/useOutsideClick';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  userProfile: any;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  getTotalItems: () => number;
  loading: boolean;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  user,
  userProfile,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  getTotalItems,
  loading,
}) => {
  const { clearCart } = useStore();
  const router = useRouter();
  const menuRef = useOutsideClick<HTMLDivElement>(onClose);

  const handleLogout = async () => {
    try {
      await clearCart();
      onClose();
      router.push('/');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <div className="md:hidden">
      {/* Menu */}
      <div
        ref={menuRef}
        className={`fixed right-0 top-0 h-full w-80 bg-gray-900 text-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">Menu</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-full text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-gray-700">
            <form onSubmit={onSearchSubmit} className="flex">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 text-white placeholder-gray-400 rounded-l-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-orange-600 text-white rounded-r-md hover:bg-orange-700"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* User Info */}
          {loading ? (
            <div className="p-4 border-b border-gray-700 bg-gray-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-600 rounded-full animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-600 rounded animate-pulse"></div>
                  <div className="h-3 bg-gray-600 rounded animate-pulse w-2/3"></div>
                </div>
              </div>
            </div>
          ) : user && userProfile ? (
            <div className="p-4 border-b border-gray-700 bg-gray-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-white">{userProfile.name || userProfile.username}</p>
                  <p className="text-sm text-gray-300">{user.email}</p>
                  <span className="inline-block px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full mt-1">
                    {userProfile.role}
                  </span>
                </div>
              </div>
            </div>
          ) : null}

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto">
            <nav className="p-4 space-y-2">
              {user ? (
                <>
                  <button
                    onClick={() => { router.push('/profile'); onClose(); }}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors text-white w-full text-left"
                  >
                    <UserIcon className="w-5 h-5" />
                    <span>Thông tin cá nhân</span>
                  </button>
                  
                  {/* Cart - Only for BUYER */}
                  {userProfile?.role === 'BUYER' && (
                    <a
                      href="/cart"
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-800 transition-colors text-white"
                      onClick={onClose}
                    >
                      <div className="flex items-center space-x-3">
                        <ShoppingCart className="w-5 h-5" />
                        <span>Giỏ hàng</span>
                      </div>
                      {getTotalItems() > 0 && (
                        <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                          {getTotalItems()}
                        </span>
                      )}
                    </a>
                  )}

                  {/* Orders - Only for BUYER */}
                  {userProfile?.role === 'BUYER' && (
                    <a
                      href="/orders"
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors text-white"
                      onClick={onClose}
                    >
                      <span className="text-lg">📋</span>
                      <span>Đơn hàng của tôi</span>
                    </a>
                  )}

                  {/* Favorites - Only for BUYER */}
                  {userProfile?.role === 'BUYER' && (
                    <a
                      href="/favorites"
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors text-white"
                      onClick={onClose}
                    >
                      <Heart className="w-5 h-5" />
                      <span>Sản phẩm yêu thích</span>
                    </a>
                  )}

                  {userProfile?.role === 'SELLER' && (
                    <>
                      <a
                        href="/shop-dashboard"
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors text-white"
                        onClick={onClose}
                      >
                        <Menu className="w-5 h-5" />
                        <span>Quản lý cửa hàng</span>
                      </a>

                      <a
                        href="/add"
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors text-white"
                        onClick={onClose}
                      >
                        <span className="text-lg">➕</span>
                        <span>Thêm sản phẩm</span>
                      </a>
                    </>
                  )}

                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors w-full text-left text-red-400"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Đăng xuất</span>
                  </button>
                </>
              ) : (
                <div className="space-y-3 p-4">
                  <div className="text-center mb-4">
                    <p className="text-gray-300 text-sm mb-4">Chào mừng bạn đến với MartNow!</p>
                  </div>

                  <a
                    href="/auth/login"
                    className="block w-full text-center py-3 px-4 border border-gray-600 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                    onClick={onClose}
                  >
                    Đăng nhập
                  </a>

                  <a
                    href="/auth/register"
                    className="block w-full text-center py-3 px-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                    onClick={onClose}
                  >
                    Đăng ký ngay
                  </a>

                  <div className="text-center pt-3">
                    <p className="text-xs text-gray-400">
                      Đăng ký để trải nghiệm đầy đủ tính năng
                    </p>
                  </div>
                </div>
              )}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
