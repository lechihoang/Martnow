
'use client';

import { useEffect, useState } from "react";
import type { Product } from "@/types/entities";
import { ProductResponseDto } from "@/types/dtos";
import { UserRole } from "@/types/entities";
import { productApi } from "@/lib/api";
import ProductGrid from "@/components/ProductGrid";

// Hàm chuyển đổi ProductResponseDto thành Product
const mapProductResponseToProduct = (productDto: ProductResponseDto): Product => {
  return {
    id: productDto.id,
    name: productDto.name,
    description: productDto.description || "",
    price: productDto.price,
    imageUrl: productDto.imageUrl || "/images/banhmi.jpeg",
    isAvailable: productDto.isAvailable,
    stock: productDto.stock,
    discount: productDto.discount,
    createdAt: productDto.createdAt,
    updatedAt: productDto.updatedAt,
    sellerId: productDto.sellerId,
    categoryId: productDto.categoryId,
    seller: {
      id: productDto.seller.id,
      userId: productDto.seller.id,
      user: {
        id: productDto.seller.id,
        name: productDto.seller.user.name,
        username: productDto.seller.user.username,
        email: "",
        role: UserRole.SELLER,
        password: "",
        createdAt: new Date(),
        updatedAt: new Date(),
        reviews: [],
      },
      shopName: productDto.seller.shopName || "",
      shopAddress: productDto.seller.shopAddress || "",
      shopPhone: "",
      description: "",
      products: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    category: {
      id: productDto.category.id,
      name: productDto.category.name,
      description: productDto.category.description || "",
      products: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    images: [],
    reviews: [],
    orderItems: [],
  };
};

const ShopPage = () => {
  const [products, setProducts] = useState<(Product & { discount?: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const productDtos = await productApi.getProducts();
        const mappedProducts = productDtos.map(mapProductResponseToProduct);
        setProducts(mappedProducts);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Không thể tải danh sách sản phẩm');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-lg">Đang tải sản phẩm...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-lg text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <ProductGrid products={products} />
  );
}

export default ShopPage;