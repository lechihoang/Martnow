import React from 'react';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';
import useStore from '@/stores/store';
import { useRouter, usePathname } from 'next/navigation';
import { Search, ShoppingCart, Heart, User as UserIcon, LogOut, Store, Plus, Package, Home, ShoppingBag, BookOpen, Info } from 'lucide-react';
import { useOutsideClick } from '@/hooks/useOutsideClick';
import { UserProfile } from '@/types/auth';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  userProfile: UserProfile | null;
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
  const pathname = usePathname();
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

  const mainNavLinks = [
    { href: '/', label: 'Trang chủ', icon: Home },
    { href: '/shop', label: 'Cửa hàng', icon: ShoppingBag },
    { href: '/blog', label: 'Blog', icon: BookOpen },
    { href: '/introduction', label: 'Giới thiệu', icon: Info },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className={`md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Menu */}
      <div
        ref={menuRef}
        className={`md:hidden fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-orange-50">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-orange-600 bg-clip-text text-transparent">
                MartNow
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/60 rounded-full transition-colors text-gray-600"
              aria-label="Đóng menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <form onSubmit={onSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-4 pr-12 py-3 bg-white border border-gray-300 text-gray-900 placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-sm"
                aria-label="Tìm kiếm"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* User Info */}
          {loading ? (
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
                </div>
              </div>
            </div>
          ) : user && userProfile ? (
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-emerald-50 via-white to-orange-50">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center ring-2 ring-emerald-200">
                  <UserIcon className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{userProfile.name || userProfile.username}</p>
                  <p className="text-xs text-gray-600 truncate">{user.email}</p>
                  <span className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded-full mt-1.5 ${
                    userProfile.role === 'SELLER'
                      ? 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800'
                      : 'bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800'
                  }`}>
                    {userProfile.role === 'SELLER' ? '🏪 Người bán' : '🛒 Người mua'}
                  </span>
                </div>
              </div>
            </div>
          ) : null}

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            <nav className="p-3">
              {/* Main Navigation Links */}
              <div className="mb-4">
                <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Điều hướng
                </h3>
                <div className="space-y-1">
                  {mainNavLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={onClose}
                        className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all ${
                          isActive
                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{link.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {user ? (
                <>
                  {/* User Actions */}
                  <div className="mb-4">
                    <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Tài khoản
                    </h3>
                    <div className="space-y-1">
                      <button
                        onClick={() => { router.push('/profile'); onClose(); }}
                        className="flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        <UserIcon className="w-5 h-5" />
                        <span className="font-medium">Thông tin cá nhân</span>
                      </button>
                    </div>
                  </div>

                  {/* Buyer Specific */}
                  {userProfile?.role === 'BUYER' && (
                    <div className="mb-4">
                      <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Mua sắm
                      </h3>
                      <div className="space-y-1">
                        <Link
                          href="/cart"
                          onClick={onClose}
                          className="flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-gray-700 hover:bg-gray-100"
                        >
                          <div className="flex items-center space-x-3">
                            <ShoppingCart className="w-5 h-5" />
                            <span className="font-medium">Giỏ hàng</span>
                          </div>
                          {getTotalItems() > 0 && (
                            <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full min-w-[24px] text-center shadow-sm">
                              {getTotalItems()}
                            </span>
                          )}
                        </Link>

                        <Link
                          href="/order"
                          onClick={onClose}
                          className="flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all text-gray-700 hover:bg-gray-100"
                        >
                          <Package className="w-5 h-5" />
                          <span className="font-medium">Đơn hàng của tôi</span>
                        </Link>

                        <Link
                          href="/favorites"
                          onClick={onClose}
                          className="flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all text-gray-700 hover:bg-gray-100"
                        >
                          <Heart className="w-5 h-5" />
                          <span className="font-medium">Sản phẩm yêu thích</span>
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Seller Specific */}
                  {userProfile?.role === 'SELLER' && (
                    <div className="mb-4">
                      <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Quản lý
                      </h3>
                      <div className="space-y-1">
                        <Link
                          href="/shop-dashboard"
                          onClick={onClose}
                          className="flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all text-gray-700 hover:bg-gray-100"
                        >
                          <Store className="w-5 h-5" />
                          <span className="font-medium">Quản lý cửa hàng</span>
                        </Link>

                        <Link
                          href="/product/add"
                          onClick={onClose}
                          className="flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all text-gray-700 hover:bg-gray-100"
                        >
                          <Plus className="w-5 h-5" />
                          <span className="font-medium">Thêm sản phẩm</span>
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Logout */}
                  <div className="pt-2 border-t border-gray-200">
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all w-full text-left text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="font-medium">Đăng xuất</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-3 px-2">
                  <div className="text-center py-4">
                    <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-emerald-100 to-orange-100 rounded-full flex items-center justify-center">
                      <ShoppingBag className="w-8 h-8 text-emerald-600" />
                    </div>
                    <p className="text-gray-600 text-sm mb-1 font-medium">Chào mừng đến MartNow!</p>
                    <p className="text-gray-500 text-xs">Đăng nhập để trải nghiệm đầy đủ</p>
                  </div>

                  <Link
                    href="/auth/login"
                    onClick={onClose}
                    className="block w-full text-center py-3 px-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all font-semibold"
                  >
                    Đăng nhập
                  </Link>

                  <Link
                    href="/auth/register"
                    onClick={onClose}
                    className="block w-full text-center py-3 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all font-semibold shadow-lg shadow-emerald-500/30"
                  >
                    Đăng ký ngay
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileMenu;
