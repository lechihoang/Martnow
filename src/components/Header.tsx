
"use client";
import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import useStore from '@/stores/store';
import { useAuth } from '@/hooks/useAuth';
import { getUserProfile } from '@/lib/api';

// Header Components
import Container from './Container';
import Logo from './header/Logo';
import Navigation from './header/Navigation';
import SearchButton from './header/SearchButton';
import SearchBar from './header/SearchBar';
import CartButton from './header/CartButton';
import FavoritesDropdown from './FavoritesDropdown';
import { UserAvatar } from './header/UserAvatar';
import AuthButtons from './header/AuthButtons';
import MobileMenu from './header/MobileMenu';
import { UserProfile, UserRole } from '@/types/auth';

const Header = () => {
  const { getCartTotalItems } = useStore();
  const { user } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = React.useState(false);

  // Fetch user profile when user changes - with caching to prevent flicker
  React.useEffect(() => {
    console.log('🔍 Header: Auth state changed, user:', user?.id || 'null');

    if (user && user.id && user.email && user.aud === 'authenticated' && user.role !== 'anonymous') {
      // Only show loading if we don't have userProfile yet
      if (!userProfile) {
        setProfileLoading(true);
      }

      console.log('🔍 Header: User found, fetching profile...', user.id);
      getUserProfile().then(profile => {
        console.log('🔍 Header: Profile received:', profile);
        if (profile && profile.id) {
          setUserProfile(profile);
        } else {
          setUserProfile(null);
        }
        setProfileLoading(false);
      }).catch(error => {
        console.error('❌ Header: Error fetching user profile:', error);
        setUserProfile(null);
        setProfileLoading(false);
      });
    } else {
      console.log('🔍 Header: No user, setting userProfile to null');
      setUserProfile(null);
      setProfileLoading(false);
    }
  }, [user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-quickcart">
      <Container>
        {/* Main Header */}
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation */}
          <Navigation />

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Search */}
            <SearchButton onClick={() => setIsSearchOpen(!isSearchOpen)} />

            {/* User Actions - Only show when logged in */}
            {profileLoading ? (
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            ) : user && userProfile ? (
              <>
                {/* Favorites Dropdown - Only for BUYER */}
                {userProfile.role === 'BUYER' && (
                  <FavoritesDropdown userProfile={userProfile} />
                )}

                {/* Cart Button - Only for BUYER */}
                {userProfile.role === 'BUYER' && (
                  <CartButton />
                )}

                {/* User Avatar with Dropdown */}
                <UserAvatar userProfile={userProfile} />
              </>
            ) : (
              <AuthButtons />
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-orange-600 transition-colors"
            aria-label="Menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Search Bar - Desktop */}
        {isSearchOpen && (
          <div className="hidden md:block py-4 border-t border-gray-200">
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSubmit={handleSearch}
            />
          </div>
        )}

        {/* Mobile Menu */}
        <MobileMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          user={user}
          userProfile={userProfile}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchSubmit={handleSearch}
          getTotalItems={getCartTotalItems}
          loading={profileLoading}
        />
      </Container>
    </header>
  );
};

export default Header;
