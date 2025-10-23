'use client';

import React from 'react';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import useStore from '@/stores/store';
import { UserProfile } from '@/types/auth';

interface FavoritesDropdownProps {
  className?: string;
  userProfile: UserProfile;
}

const FavoritesDropdown: React.FC<FavoritesDropdownProps> = ({
  userProfile
}) => {
  const { getFavoritesCount } = useStore();

  const favoritesCount = getFavoritesCount();

  // Only show for buyers
  if (!userProfile || userProfile.role !== 'BUYER') {
    return null;
  }

  return (
    <Link
      href="/favorites"
      className="relative p-2 text-gray-600 hover:text-red-500 transition-colors tooltip-trigger"
      aria-label="Sản phẩm yêu thích"
      title="Sản phẩm yêu thích"
    >
      <Heart className={`w-6 h-6 ${favoritesCount > 0 ? 'text-red-500' : ''}`} />
      {favoritesCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {favoritesCount > 99 ? '99+' : favoritesCount}
        </span>
      )}
    </Link>
  );
};

export default FavoritesDropdown;
