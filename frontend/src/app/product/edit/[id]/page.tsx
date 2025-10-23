'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { productApi, getUserProfile, uploadApi } from '@/lib/api';
import { ArrowLeft, Upload, X, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { User } from '@/types/entities';

interface Category {
  id: number;
  name: string;
}

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  stock: number;
  discount: number;
  categoryId: number;
  imageUrl: string;
}

export default function ProductEditPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  const productId = parseInt(params.id as string);

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    discount: 0,
    categoryId: 0,
    imageUrl: ''
  });

  useEffect(() => {
    const initializePage = async () => {
      setLoading(true);

      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Get user profile
        const profile = await getUserProfile();
        setUserProfile(profile);

        // Check if user is seller
        if (profile?.role !== 'SELLER') {
          setError('Chỉ người bán mới có thể chỉnh sửa sản phẩm');
          setLoading(false);
          return;
        }

        // Load categories
        const categoriesData = await productApi.getCategories();
        setCategories(categoriesData);

        // Load product data for editing
        if (productId && !isNaN(productId)) {
          const product = await productApi.getProduct(productId);
          setFormData({
            name: product.name || '',
            description: product.description || '',
            price: product.price || 0,
            stock: product.stock || 0,
            discount: product.discount || 0,
            categoryId: product.category?.id || 0,
            imageUrl: product.imageUrl || ''
          });
        } else {
          setError('ID sản phẩm không hợp lệ');
        }
      } catch (error) {
        console.error('Error initializing page:', error);
        setError('Có lỗi xảy ra khi tải trang');
      } finally {
        setLoading(false);
      }
    };

    initializePage();
  }, [user, productId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'categoryId' || name === 'price' || name === 'stock' || name === 'discount'
        ? Number(value)
        : value
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn file hình ảnh');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Kích thước ảnh không được vượt quá 5MB');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      console.log('📤 Uploading image...');
      const response = await uploadApi.uploadFile(file, 'product');

      if (response.data && response.data.length > 0) {
        const imageUrl = response.data[0].secureUrl;
        console.log('✅ Image uploaded:', imageUrl);

        setFormData(prev => ({
          ...prev,
          imageUrl
        }));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi tải ảnh lên';
      console.error('❌ Error uploading image:', error);
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      imageUrl: ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Tên sản phẩm không được để trống');
      return;
    }

    if (formData.price <= 0) {
      setError('Giá sản phẩm phải lớn hơn 0');
      return;
    }

    if (formData.categoryId === 0) {
      setError('Vui lòng chọn danh mục');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Update product
      await productApi.updateProduct(productId, formData);
      router.push('/shop-dashboard?tab=products');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi cập nhật sản phẩm';
      console.error('Error updating product:', error);
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Đang tải...</h2>
          <p className="text-gray-600">Đang tải thông tin sản phẩm</p>
        </div>
      </div>
    );
  }

  if (!user || !userProfile || userProfile.role !== 'SELLER') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Truy cập bị từ chối</h2>
          <p className="text-gray-600">Chỉ người bán mới có thể chỉnh sửa sản phẩm</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Quay lại
          </button>

          <h1 className="text-3xl font-bold text-gray-900">
            Chỉnh sửa sản phẩm
          </h1>
          <p className="text-gray-600">
            Cập nhật thông tin sản phẩm của bạn
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex">
              <X className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg">
          <div className="px-6 py-6 space-y-6">
            {/* Product Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Tên sản phẩm *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập tên sản phẩm"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả sản phẩm
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập mô tả sản phẩm"
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
                Danh mục *
              </label>
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value={0}>Chọn danh mục</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price and Stock */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  Giá bán (VNĐ) *
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="1000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                  required
                />
              </div>

              <div>
                <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-2">
                  Số lượng tồn kho
                </label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Discount */}
            <div>
              <label htmlFor="discount" className="block text-sm font-medium text-gray-700 mb-2">
                Giảm giá (%)
              </label>
              <input
                type="number"
                id="discount"
                name="discount"
                value={formData.discount}
                onChange={handleInputChange}
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hình ảnh sản phẩm
              </label>

              {formData.imageUrl ? (
                <div className="space-y-3">
                  {/* Image Preview */}
                  <div className="relative inline-block">
                    <Image
                      src={formData.imageUrl}
                      alt="Product preview"
                      width={200}
                      height={200}
                      className="h-48 w-48 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg"
                      title="Xóa ảnh"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* URL Input (optional) */}
                  <div>
                    <label htmlFor="imageUrl" className="block text-xs text-gray-500 mb-1">
                      Hoặc nhập URL hình ảnh
                    </label>
                    <input
                      type="url"
                      id="imageUrl"
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Upload Button */}
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="image-upload"
                      className={`flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 ${
                        uploading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {uploading ? (
                          <>
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-3"></div>
                            <p className="text-sm text-gray-600">Đang tải ảnh lên...</p>
                          </>
                        ) : (
                          <>
                            <Upload className="w-10 h-10 mb-3 text-gray-400" />
                            <p className="mb-2 text-sm text-gray-500">
                              <span className="font-semibold">Nhấp để tải ảnh lên</span> hoặc kéo thả
                            </p>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF (tối đa 5MB)</p>
                          </>
                        )}
                      </div>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* URL Input Alternative */}
                  <div>
                    <label htmlFor="imageUrl" className="block text-xs text-gray-500 mb-1">
                      Hoặc nhập URL hình ảnh
                    </label>
                    <input
                      type="url"
                      id="imageUrl"
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className={`px-6 py-2 rounded-md text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                saving
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {saving ? 'Đang cập nhật...' : 'Cập nhật sản phẩm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}