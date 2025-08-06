"use client";
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import type { Product } from '../types/entities';
import { productApi } from '../lib/api';

interface Category {
  id: number;
  name: string;
  description: string;
}

const AddProductForm = () => {
  const [form, setForm] = useState<
    Partial<Product> & { categoryId?: number }
  >({
    name: '',
    description: '',
    categoryId: undefined,
    price: 0,
    stock: 0,
  });
  const [loading, setLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
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
    const files = Array.from(e.target.files || []);
    
    // Giới hạn số lượng ảnh (tối đa 5 ảnh)
    if (files.length > 5) {
      toast.error('Chỉ được chọn tối đa 5 ảnh');
      return;
    }

    // Kiểm tra kích thước file (tối đa 5MB mỗi ảnh)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const invalidFiles = files.filter(file => file.size > maxSize);
    if (invalidFiles.length > 0) {
      toast.error('Mỗi ảnh phải nhỏ hơn 5MB');
      return;
    }

    setSelectedImages(files);

    // Tạo preview cho các ảnh
    const previews: string[] = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        previews.push(e.target?.result as string);
        if (previews.length === files.length) {
          setImagePreviews([...previews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setSelectedImages(newImages);
    setImagePreviews(newPreviews);
  };

    const convertImagesToBase64 = async (): Promise<{imageData: string, mimeType: string, originalName: string, fileSize: number}[]> => {
    if (selectedImages.length === 0) return [];

    const base64Promises = selectedImages.map(async (file) => {
      return new Promise<{imageData: string, mimeType: string, originalName: string, fileSize: number}>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          resolve({
            imageData: result, // Base64 data URL
            mimeType: file.type,
            originalName: file.name,
            fileSize: file.size
          });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    return Promise.all(base64Promises);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Kiểm tra validation
      if (!form.categoryId) {
        toast.error('Vui lòng chọn danh mục sản phẩm');
        return;
      }

      // Chuyển đổi ảnh thành base64 trực tiếp
      const imageBase64Array = await convertImagesToBase64();
      
      const res = await fetch('http://localhost:3001/products', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        credentials: 'include', // Để gửi cookie authentication
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          categoryId: form.categoryId, // Gửi categoryId thay vì categories
          price: form.price,
          stock: form.stock, // Thêm số lượng
          images: imageBase64Array, // Gửi base64 data URLs
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        toast.success('Đã thêm sản phẩm thành công!');
        // Reset form sau khi thành công
        setForm({
          name: '',
          description: '',
          categoryId: undefined,
          price: 0,
          stock: 0,
        });
        setSelectedImages([]);
        setImagePreviews([]);
      } else {
        // Xử lý các mã lỗi cụ thể
        if (res.status === 403) {
          toast.error('Chỉ người bán mới có thể thêm sản phẩm');
        } else if (res.status === 401) {
          toast.error('Vui lòng đăng nhập để thêm sản phẩm.');
        } else {
          try {
            const errorData = await res.json();
            toast.error(errorData.message || `Lỗi ${res.status}: Không thể thêm sản phẩm`);
          } catch (parseError) {
            toast.error(`Lỗi ${res.status}: Không thể thêm sản phẩm`);
          }
        }
      }
    } catch (err) {
      toast.error('Có lỗi xảy ra! Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 border rounded bg-white shadow">
      <h2 className="text-xl font-bold mb-4">Thêm sản phẩm mới</h2>
      
      {/* Tên sản phẩm */}
      <div className="mb-2">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Tên sản phẩm *
        </label>
        <input 
          id="name"
          name="name" 
          value={form.name} 
          onChange={handleChange} 
          placeholder="Nhập tên sản phẩm" 
          className="w-full p-2 border rounded"
          required 
        />
      </div>

      {/* Mô tả sản phẩm */}
      <div className="mb-2">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Mô tả sản phẩm
        </label>
        <textarea 
          id="description"
          name="description" 
          value={form.description} 
          onChange={handleChange} 
          placeholder="Nhập mô tả chi tiết về sản phẩm" 
          className="w-full p-2 border rounded" 
          rows={3}
        />
      </div>
      
      {/* Dropdown chọn danh mục */}
      <div className="mb-2">
        <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
          Danh mục sản phẩm *
        </label>
        {loadingCategories ? (
          <div className="w-full p-2 border rounded bg-gray-100">Đang tải danh mục...</div>
        ) : (
          <select
            id="categoryId"
            name="categoryId"
            value={form.categoryId || ''}
            onChange={(e) => setForm({ ...form, categoryId: Number(e.target.value) || undefined })}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">-- Chọn danh mục --</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name} - {category.description}
              </option>
            ))}
          </select>
        )}
      </div>
      
      {/* Giá bán */}
      <div className="mb-2">
        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
          Giá bán (VNĐ) *
        </label>
        <input 
          id="price"
          name="price" 
          type="number" 
          min={0} 
          step="1000"
          value={form.price} 
          onChange={handleChange} 
          placeholder="Nhập giá bán sản phẩm" 
          className="w-full p-2 border rounded"
          required 
        />
      </div>
      
      {/* Số lượng trong kho */}
      <div className="mb-2">
        <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
          Số lượng trong kho *
        </label>
        <input 
          id="stock"
          name="stock" 
          type="number" 
          min={0} 
          value={form.stock} 
          onChange={handleChange} 
          placeholder="Nhập số lượng sản phẩm có sẵn" 
          className="w-full p-2 border rounded"
          required 
        />
      </div>
      
      {/* Input upload ảnh */}
      <div className="mb-4">
        <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-2">
          Hình ảnh sản phẩm (tối đa 5 ảnh)
        </label>
        <input
          id="images"
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageChange}
          className="w-full p-2 border rounded"
        />
      </div>

      {/* Preview ảnh */}
      {imagePreviews.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Xem trước ảnh:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-24 object-cover rounded border"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded mt-2 disabled:bg-gray-400">{loading ? 'Đang gửi...' : 'Thêm sản phẩm'}</button>
    </form>
  );
};

export default AddProductForm;
