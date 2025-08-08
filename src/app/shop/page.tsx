
'use client';

import { useEffect, useState } from "react";
import type { Product } from "@/types/entities";
import { ProductResponseDto } from "@/types/dtos";
import { UserRole } from "@/types/entities";
import { productApi, favoritesApi } from "@/lib/api";
import ProductGrid from "@/components/ProductGrid";
import useUser from "@/hooks/useUser";

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
  const [favoriteStatus, setFavoriteStatus] = useState<Record<number, boolean>>({});
  const [productsLoading, setProductsLoading] = useState(true);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  // Tổng loading state - chỉ false khi tất cả đã load xong
  const loading = productsLoading || favoritesLoading;

  useEffect(() => {
    fetchProducts();
  }, []);

  // Load favorite status when user changes
  useEffect(() => {
    if (user && user.buyer && products.length > 0) {
      loadFavoriteStatus();
    } else if (user && !user.buyer && products.length > 0) {
      // Nếu không phải buyer thì không cần load favorites
      setFavoritesLoading(false);
    }
  }, [user, products]);

  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      const productDtos = await productApi.getProducts();
      const mappedProducts = productDtos.map(mapProductResponseToProduct);
      setProducts(mappedProducts);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Không thể tải danh sách sản phẩm');
    } finally {
      setProductsLoading(false);
    }
  };

  const loadFavoriteStatus = async () => {
    try {
      setFavoritesLoading(true);
      const productIds = products.map(p => p.id);
      const status = await favoritesApi.getFavoriteStatus(productIds);
      setFavoriteStatus(status);
    } catch (err) {
      console.error('Error loading favorite status:', err);
    } finally {
      setFavoritesLoading(false);
    }
  };

  const handleFavoriteChange = (productId: number, isFavorite: boolean) => {
    setFavoriteStatus(prev => ({
      ...prev,
      [productId]: isFavorite
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-shop_dark_green mx-auto mb-4"></div>
          <div className="text-lg">
            {productsLoading ? 'Đang tải sản phẩm...' : 
             favoritesLoading ? 'Đang tải trạng thái yêu thích...' : 
             'Đang tải...'}
          </div>
        </div>
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
    <ProductGrid 
      products={products} 
      favoriteStatus={favoriteStatus}
      onFavoriteChange={handleFavoriteChange}
    />
  );
}

export default ShopPage;