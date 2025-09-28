import React from 'react'
import ProductCard from './ProductCard'
import type { ProductResponseDto } from '../types/dtos'
import { UserProfile } from '@/types/auth';
import { User } from '@supabase/supabase-js';

type ProductGridProps = {
  products: ProductResponseDto[]
  favoriteStatus?: Record<number, boolean>
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
}

const ProductGrid = ({
  products,
  favoriteStatus = {},
  user,
  userProfile,
  loading
}: ProductGridProps) => {
  // Safety check to ensure products is an array
  const safeProducts = Array.isArray(products) ? products : [];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full">
      {safeProducts.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          isFavorite={favoriteStatus[product.id]}
          user={user}
          userProfile={userProfile}
          loading={loading}
        />
      ))}
    </div>
  )
}

export default ProductGrid