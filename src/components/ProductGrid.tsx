import React from 'react'
import Container from './Container'
import ProductCard from './ProductCard'
import type { ProductResponseDto } from '../types/dtos'

type ProductGridProps = {
  products: ProductResponseDto[]
  favoriteStatus?: Record<number, boolean>
  onFavoriteChange?: (productId: number, isFavorite: boolean) => void
}

const ProductGrid = ({ products, favoriteStatus = {}, onFavoriteChange }: ProductGridProps) => {
  return (
    <Container className="flex flex-col lg:px-0 my-10">
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 mt-10 animate-in fade-in duration-500">
        {products.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product} 
            isFavorite={favoriteStatus[product.id]}
            onFavoriteChange={onFavoriteChange}
          />
        ))}
      </div>
    </Container>
  )
}

export default ProductGrid