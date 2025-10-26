"use client";
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ProductDetail from '@/components/ProductDetail';
import type { Product } from '@/types/entities';
import { productApi, userApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { UserProfile } from '@/types/auth';

export default function ProductPage() {
  const params = useParams();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const productId = params?.id;
        if (!productId) {
          throw new Error('ID sản phẩm không hợp lệ');
        }

        const data = await productApi.getProduct(Number(productId));
        setProduct(data as unknown as Product);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
      } finally {
        setLoading(false);
      }
    };

    if (params?.id) {
      fetchProduct();
    }
  }, [params?.id]);

  // Fetch user profile when user changes
  useEffect(() => {
    if (user) {
      userApi.getProfile().then(profile => {
        if (profile && profile.id) {
          const newProfile = {
            id: profile.id,
            name: profile.name,
            username: profile.username,
            email: profile.email,
            avatar: profile.avatar,
            role: profile.role
          };
          setUserProfile(newProfile);
        } else {
          setUserProfile(null);
        }
      }).catch(error => {
        console.error('Error fetching user profile:', error);
        setUserProfile(null);
      });
    } else if (!user) {
      setUserProfile(null);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
            {/* Image skeleton */}
            <div className="space-y-4">
              <div className="h-80 bg-gray-200 rounded-lg"></div>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-square bg-gray-200 rounded-md"></div>
                ))}
              </div>
            </div>

            {/* Content skeleton */}
            <div className="space-y-6">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Lỗi</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-600 mb-4">
            Không tìm thấy sản phẩm
          </h1>
          <p className="text-gray-500">
            Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm">
        <ol className="flex items-center space-x-2 text-gray-500">
          <li><Link href="/" className="hover:text-blue-600">Trang chủ</Link></li>
          <li>›</li>
          <li><Link href="/shop" className="hover:text-blue-600">Sản phẩm</Link></li>
          <li>›</li>
          {product.category && (
            <>
              <li>
                <a href={`/category/${product.category.id}`} className="hover:text-blue-600">
                  {product.category.name}
                </a>
              </li>
              <li>›</li>
            </>
          )}
          <li className="text-gray-900 font-medium">{product.name}</li>
        </ol>
      </nav>

      {/* Product Detail */}
      <ProductDetail product={product} userProfile={userProfile} />
    </div>
  );
}
