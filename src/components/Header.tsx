
"use client";
import React from 'react'
import Logo from './Logo'
import HeaderMenu from './HeaderMenu'
import Container from './Container'
import SignIn from './SignIn'
import SignUp from './SignUp'
import UserMenu from './UserMenu'
import SearchBar from './SearchBar'
import { ShoppingBag } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/hooks/useCart'
import FavoritesDropdown from './FavoritesDropdown'

import useUser from '@/hooks/useUser';


const Header = () => {
  const { user, loading } = useUser();
  const { getTotalItems } = useCart();
  const router = useRouter();
  
  return (
    <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b">
      <Container>
        {/* Top Row: Logo, SearchBar, User Actions */}
        <div className="flex items-center justify-between py-4 text-lightColor">
          <Logo />
          
          {/* SearchBar - chiếm vị trí giữa */}
          <div className="flex-1 max-w-2xl mx-8">
            <SearchBar placeholder="Tìm kiếm món ăn yêu thích..." />
          </div>
          
          <div className="flex items-center space-x-4">
            {/* User Menu */}
            {loading ? (
              <div className="px-4 py-2 text-sm">Loading...</div>
            ) : user ? (
              <>
                {/* Favorites Dropdown - only show when logged in */}
                <FavoritesDropdown />
                
                {/* Cart Icon - chỉ hiện khi đã đăng nhập */}
                <button
                  onClick={() => router.push('/cart')}
                  className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ShoppingBag className="w-6 h-6" />
                  {getTotalItems() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {getTotalItems() > 99 ? '99+' : getTotalItems()}
                    </span>
                  )}
                </button>
                
                <UserMenu user={user} />
              </>
            ) : (
              <>
                <SignUp />
                <span className="mx-3 w-px h-6 bg-gray-600" />
                <SignIn />
              </>
            )}
          </div>
        </div>
        
        {/* Bottom Row: Navigation Menu */}
        <div className="border-t bg-white/50 py-3">
          <HeaderMenu />
        </div>
      </Container>
    </header>
  );
}

export default Header
