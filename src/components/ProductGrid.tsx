import React from 'react'
import Container from './Container'
import ProductCard from './ProductCard'
import type { Product } from '../types/entities'

type ProductGridProps = {
  products: Product[]
}

const ProductGrid = ({ products }: ProductGridProps) => {
  return (
    <Container className="flex flex-col lg:px-0 my-10">
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 mt-10">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </Container>
  )
}

export default ProductGrid