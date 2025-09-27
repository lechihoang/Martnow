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

  const uploadProductImages = async (productId: number): Promise<string[]> => {
    if (selectedImages.length === 0) return [];

    try {
      // Create FormData for file upload
      const formData = new FormData();
      
      // Add all selected images to FormData
      selectedImages.forEach((file) => {
        formData.append('files', file);
      });
      
      formData.append('entityType', 'product');
      formData.append('entityId', productId.toString());

      // Upload to backend media endpoint
      const response = await fetch('http://localhost:3001/media/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const uploadedFiles = await response.json();
      
      // Return array of secure URLs
      return uploadedFiles.map((file: any) => file.secureUrl);
    } catch (error) {
      console.error('Image upload error:', error);
      throw new Error('Không thể tải ảnh lên');
    }
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

      // Step 1: Create product without images first
      const productResponse = await fetch('http://localhost:3001/product', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        credentials: 'include',
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          categoryId: form.categoryId,
          price: form.price,
          stock: form.stock,
        }),
      });
      
      if (!productResponse.ok) {
        // Handle product creation errors
        if (productResponse.status === 403) {
          toast.error('Chỉ người bán mới có thể thêm sản phẩm');
        } else if (productResponse.status === 401) {
          toast.error('Vui lòng đăng nhập để thêm sản phẩm.');
        } else {
          try {
            const errorData = await productResponse.json();
            toast.error(errorData.message || `Lỗi ${productResponse.status}: Không thể thêm sản phẩm`);
          } catch {
            toast.error(`Lỗi ${productResponse.status}: Không thể thêm sản phẩm`);
          }
        }
        return;
      }

      const createdProduct = await productResponse.json();
      const productId = createdProduct.id;

      // Step 2: Upload images if any
      if (selectedImages.length > 0) {
        try {
          await uploadProductImages(productId);
          toast.success('Đã thêm sản phẩm và tải ảnh thành công!');
        } catch (error) {
          // Product created but image upload failed
          console.error('Image upload failed:', error);
          toast.success('Đã thêm sản phẩm thành công, nhưng có lỗi khi tải ảnh lên');
        }
      } else {
        toast.success('Đã thêm sản phẩm thành công!');
      }
      
      // Reset form after success
      setForm({
        name: '',
        description: '',
        categoryId: undefined,
        price: 0,
        stock: 0,
      });
      setSelectedImages([]);
      setImagePreviews([]);
      
    } catch (error) {
      console.error('Submit error:', error);
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
