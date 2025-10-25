"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import type { Product } from '../types/entities';
import { productApi, uploadApi } from '../lib/api';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface Category {
  id: number;
  name: string;
  description?: string;
}

const AddProductForm = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [form, setForm] = useState<
    Partial<Product> & { categoryId?: number }
  >({
    name: '',
    description: '',
    categoryId: undefined,
    price: 0,
    stock: 0,
    discount: 0,
  });
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Load categories khi component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await productApi.getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Không thể tải danh sách danh mục');
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm({
      ...form,
      [name]: type === 'number' ? Number(value) : value,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Kiểm tra kích thước file (tối đa 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('Ảnh phải nhỏ hơn 5MB');
      return;
    }

    // Kiểm tra loại file
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh');
      return;
    }

    setSelectedImage(file);

    // Tạo preview cho ảnh
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview('');
  };

  const uploadProductImage = async (): Promise<string | null> => {
    if (!selectedImage) return null;

    try {
      console.log('📤 Uploading image...');
      const response = await uploadApi.uploadFile(selectedImage, 'product');

      if (response.data && response.data.length > 0) {
        const imageUrl = response.data[0].secureUrl;
        console.log('✅ Image uploaded:', imageUrl);
        return imageUrl;
      }

      return null;
    } catch (error) {
      console.error('Image upload error:', error);
      throw new Error('Không thể tải ảnh lên');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Kiểm tra đăng nhập
    if (!user) {
      toast.error('Vui lòng đăng nhập để thêm sản phẩm');
      router.push('/auth/login');
      return;
    }

    // Kiểm tra validation
    if (!form.name?.trim()) {
      toast.error('Tên sản phẩm không được để trống');
      return;
    }

    if (!form.categoryId) {
      toast.error('Vui lòng chọn danh mục sản phẩm');
      return;
    }

    if (!form.price || form.price <= 0) {
      toast.error('Giá sản phẩm phải lớn hơn 0');
      return;
    }

    setLoading(true);

    try {
      // Step 1: Upload image first (if any)
      let imageUrl = '';
      if (selectedImage) {
        try {
          const uploadedImageUrl = await uploadProductImage();
          if (uploadedImageUrl) {
            imageUrl = uploadedImageUrl;
          }
        } catch (error) {
          console.error('Image upload failed:', error);
          toast.error('Có lỗi khi tải ảnh lên. Vui lòng thử lại.');
          setLoading(false);
          return;
        }
      }

      // Step 2: Create product with image URL
      const productData = {
        name: form.name || '',
        description: form.description || '',
        categoryId: form.categoryId || 0,
        price: form.price || 0,
        stock: form.stock || 0,
        discount: form.discount || 0,
        imageUrl: imageUrl,
        isAvailable: true,
      };

      console.log('📦 Creating product:', productData);
      const createdProduct = await productApi.createProduct(productData);
      console.log('✅ Product created:', createdProduct);

      toast.success('Đã thêm sản phẩm thành công!');

      // Reset form after success
      setForm({
        name: '',
        description: '',
        categoryId: undefined,
        price: 0,
        stock: 0,
        discount: 0,
      });
      setSelectedImage(null);
      setImagePreview('');

      // Redirect to shop dashboard after a short delay
      setTimeout(() => {
        router.push('/shop-dashboard?tab=products');
      }, 1000);

    } catch (error) {
      console.error('Submit error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra! Vui lòng thử lại.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Thêm sản phẩm mới</h1>
          <p className="text-gray-600">Điền thông tin sản phẩm của bạn để bắt đầu bán hàng</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-8 py-6">
            <h2 className="text-2xl font-semibold text-white flex items-center gap-3">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Thông tin sản phẩm
            </h2>
          </div>

          <div className="p-8">{/* Form Body */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tên sản phẩm */}
              <div className="md:col-span-2">
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Tên sản phẩm <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Ví dụ: Gạo ST25 túi 5kg"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Dropdown chọn danh mục */}
              <div>
                <label htmlFor="categoryId" className="block text-sm font-semibold text-gray-700 mb-2">
                  Danh mục sản phẩm <span className="text-red-500">*</span>
                </label>
                {loadingCategories ? (
                  <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                    Đang tải danh mục...
                  </div>
                ) : (
                  <select
                    id="categoryId"
                    name="categoryId"
                    value={form.categoryId || ''}
                    onChange={(e) => setForm({ ...form, categoryId: Number(e.target.value) || undefined })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white"
                    required
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Số lượng trong kho */}
              <div>
                <label htmlFor="stock" className="block text-sm font-semibold text-gray-700 mb-2">
                  Số lượng trong kho <span className="text-red-500">*</span>
                </label>
                <input
                  id="stock"
                  name="stock"
                  type="number"
                  min={0}
                  value={form.stock}
                  onChange={handleChange}
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
                    id="price"
                    name="price"
                    type="number"
                    min={0}
                    step="1000"
                    value={form.price}
                    onChange={handleChange}
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
                  id="discount"
                  name="discount"
                  type="number"
                  min={0}
                  max={100}
                  value={form.discount || 0}
                  onChange={handleChange}
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
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Nhập mô tả chi tiết về sản phẩm, nguồn gốc, chất lượng..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
                  rows={4}
                />
              </div>
            </div>

            {/* Divider */}
            <div className="my-8 border-t border-gray-200"></div>

            {/* Input upload ảnh */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Hình ảnh sản phẩm
                <span className="text-gray-500 font-normal ml-2">(Kích thước &lt; 5MB)</span>
              </label>

              {!imagePreview ? (
                <label
                  htmlFor="images"
                  className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-emerald-500 transition-colors cursor-pointer"
                >
                  <div className="space-y-1 text-center">
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
                  </div>
                  <input
                    id="images"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="sr-only"
                  />
                </label>
              ) : (
                <div className="mt-2">
                  <div className="relative inline-block">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      width={400}
                      height={300}
                      className="w-full max-w-md h-64 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg hover:bg-red-600 shadow-lg transition-colors"
                    >
                      ×
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    <label htmlFor="images" className="text-emerald-600 hover:text-emerald-700 cursor-pointer font-medium">
                      Chọn ảnh khác
                    </label>
                    <input
                      id="images"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="sr-only"
                    />
                  </p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 mt-8">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-emerald-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang thêm sản phẩm...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Thêm sản phẩm
                  </span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductForm;
