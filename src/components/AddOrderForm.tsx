"use client";
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import type { Product } from '../types/entities';

const AddProductForm = () => {
  const [form, setForm] = useState<
    Partial<Product> & { categoriesInput?: string }
  >({
    name: '',
    description: '',
    categoriesInput: '',
    price: 0,
  });
  const [loading, setLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

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
      // Chuyển đổi ảnh thành base64 trực tiếp
      const imageBase64Array = await convertImagesToBase64();
      
      // Parse categories from input string
      const categoryNames = (form.categoriesInput || '').split(',').map(v => v.trim()).filter(Boolean);
      const categories = categoryNames.map(name => ({ name }));
      
      const res = await fetch('http://localhost:3001/products', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        credentials: 'include', // Để gửi cookie authentication
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          categories,
          price: form.price,
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
          categoriesInput: '',
          price: 0,
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
      <input name="name" value={form.name} onChange={handleChange} placeholder="Tên sản phẩm" className="mb-2 w-full p-2 border rounded" />
      <textarea name="description" value={form.description} onChange={handleChange} placeholder="Mô tả sản phẩm" className="mb-2 w-full p-2 border rounded" />
      <input
        name="categoriesInput"
        value={form.categoriesInput || ''}
        onChange={handleChange}
        placeholder="Nhập các danh mục, cách nhau bởi dấu phẩy"
        className="mb-2 w-full p-2 border rounded"
      />
      <input name="price" type="number" min={0} value={form.price} onChange={handleChange} placeholder="Giá bán" className="mb-2 w-full p-2 border rounded" />
      
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
