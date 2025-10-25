'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { productApi, getUserProfile, uploadApi } from '@/lib/api';
import { ArrowLeft, Upload, X, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { User } from '@/types/entities';
import toast from 'react-hot-toast';

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
  isAvailable: boolean;
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
    imageUrl: '',
    isAvailable: true
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
            imageUrl: product.imageUrl || '',
            isAvailable: product.isAvailable !== undefined ? product.isAvailable : true
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
      toast.error('Vui lòng chọn file hình ảnh');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh không được vượt quá 5MB');
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
        toast.success('Tải ảnh lên thành công');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi tải ảnh lên';
      console.error('❌ Error uploading image:', error);
      toast.error(errorMessage);
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
      toast.error('Tên sản phẩm không được để trống');
      return;
    }

    if (formData.price <= 0) {
      toast.error('Giá sản phẩm phải lớn hơn 0');
      return;
    }

    if (formData.categoryId === 0) {
      toast.error('Vui lòng chọn danh mục');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Update product
      await productApi.updateProduct(productId, formData);
      toast.success('Cập nhật sản phẩm thành công');
      setTimeout(() => {
        router.push('/shop-dashboard?tab=products');
      }, 1000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi cập nhật sản phẩm';
      console.error('Error updating product:', error);
      toast.error(errorMessage);
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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Chỉnh sửa sản phẩm</h1>
          <p className="text-gray-600">Cập nhật thông tin sản phẩm của bạn</p>
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
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-8 py-6">
            <h2 className="text-2xl font-semibold text-white flex items-center gap-3">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Thông tin sản phẩm
            </h2>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tên sản phẩm */}
              <div className="md:col-span-2">
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Tên sản phẩm <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: Gạo ST25 túi 5kg"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Danh mục */}
              <div>
                <label htmlFor="categoryId" className="block text-sm font-semibold text-gray-700 mb-2">
                  Danh mục sản phẩm <span className="text-red-500">*</span>
                </label>
                <select
                  id="categoryId"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white"
                  required
                >
                  <option value={0}>-- Chọn danh mục --</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Số lượng trong kho */}
              <div>
                <label htmlFor="stock" className="block text-sm font-semibold text-gray-700 mb-2">
                  Số lượng trong kho <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="100"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Giá bán */}
              <div>
                <label htmlFor="price" className="block text-sm font-semibold text-gray-700 mb-2">
                  Giá bán (VNĐ) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    step="1000"
                    placeholder="50000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">đ</span>
                </div>
              </div>

              {/* Giảm giá */}
              <div>
                <label htmlFor="discount" className="block text-sm font-semibold text-gray-700 mb-2">
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
                  placeholder="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Mô tả sản phẩm */}
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                  Mô tả sản phẩm
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Nhập mô tả chi tiết về sản phẩm, nguồn gốc, chất lượng..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
                  rows={4}
                />
              </div>
            </div>

            {/* Divider */}
            <div className="my-8 border-t border-gray-200"></div>

            {/* Toggle Trạng thái bán hàng */}
            <div className="mb-6">
              <label className="flex items-center justify-between p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <div>
                  <span className="block text-sm font-semibold text-gray-700">
                    Cho phép bán sản phẩm
                  </span>
                  <span className="text-xs text-gray-500 mt-1 block">
                    {formData.isAvailable ? 'Sản phẩm đang được hiển thị và có thể mua' : 'Sản phẩm tạm ngừng bán'}
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-8 bg-gray-300 rounded-full peer-checked:bg-emerald-600 transition-colors"></div>
                  <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-transform peer-checked:translate-x-6 shadow-md"></div>
                </div>
              </label>
            </div>

            {/* Upload ảnh */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Hình ảnh sản phẩm
                <span className="text-gray-500 font-normal ml-2">(Kích thước &lt; 5MB)</span>
              </label>

              {formData.imageUrl ? (
                <div className="mt-2">
                  <div className="relative inline-block">
                    <Image
                      src={formData.imageUrl}
                      alt="Preview"
                      width={400}
                      height={300}
                      className="w-full max-w-md h-64 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg hover:bg-red-600 shadow-lg transition-colors"
                    >
                      ×
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    <label htmlFor="image-upload" className="text-emerald-600 hover:text-emerald-700 cursor-pointer font-medium">
                      Chọn ảnh khác
                    </label>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="sr-only"
                    />
                  </p>
                </div>
              ) : (
                <label
                  htmlFor="image-upload"
                  className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-emerald-500 transition-colors cursor-pointer"
                >
                  <div className="space-y-1 text-center">
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent mx-auto mb-3"></div>
                        <p className="text-sm text-gray-600">Đang tải ảnh lên...</p>
                      </>
                    ) : (
                      <>
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <span className="font-medium text-emerald-600 hover:text-emerald-500">
                            Nhấp để tải ảnh lên
                          </span>
                          <p className="pl-1">hoặc kéo thả ảnh vào đây</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF</p>
                      </>
                    )}
                  </div>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="sr-only"
                  />
                </label>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 mt-8">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 bg-gray-100 text-gray-700 py-4 px-6 rounded-lg font-semibold hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-emerald-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang cập nhật...
                  </span>
                ) : (
                  'Cập nhật sản phẩm'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}