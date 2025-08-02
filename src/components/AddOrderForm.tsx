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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm({
      ...form,
      [name]: type === 'number' ? Number(value) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    // Debug: Kiểm tra user hiện tại
    const currentUser = localStorage.getItem('user');
    console.log('Current user:', currentUser ? JSON.parse(currentUser) : 'No user found');
    
    // Parse categories from input string
    const categoryNames = (form.categoriesInput || '').split(',').map(v => v.trim()).filter(Boolean);
    const categories = categoryNames.map(name => ({ name }));
    
    try {
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
      <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded mt-2">{loading ? 'Đang gửi...' : 'Thêm sản phẩm'}</button>
    </form>
  );
};

export default AddProductForm;
