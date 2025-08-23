'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X, Upload } from 'lucide-react';
import { blogApi, uploadApi } from '../lib/api';
import useUser from '../hooks/useUser';

interface BlogFormProps {
  blogId?: number;
}

interface BlogData {
  title: string;
  content: string;
  imageUrl?: string;
  featuredImage?: string;
}

const BlogForm: React.FC<BlogFormProps> = ({ blogId }) => {
  const [formData, setFormData] = useState<BlogData>({
    title: '',
    content: '',
    imageUrl: '',
    featuredImage: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string>('');
  const { user, loading: userLoading } = useUser();
  const router = useRouter();

  const isEdit = Boolean(blogId);

  useEffect(() => {
    // Wait for user loading to complete before checking authentication
    if (userLoading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }

    if (isEdit && blogId) {
      fetchBlog();
    }
  }, [user, userLoading, blogId, isEdit, router]);

  const fetchBlog = async () => {
    if (!blogId) return;

    try {
      setLoading(true);
      const blog = await blogApi.getBlog(blogId);
      
      // Check if user is the author
      if (blog.author.id !== user?.id) {
        alert('Bạn không có quyền chỉnh sửa bài viết này');
        router.push('/blogs');
        return;
      }

      setFormData({
        title: blog.title,
        content: blog.content,
        imageUrl: blog.imageUrl || '',
        featuredImage: blog.featuredImage || '',
      });
      
      if (blog.featuredImage) {
        setFeaturedImagePreview(blog.featuredImage);
      }
    } catch (err) {
      console.error('Error fetching blog:', err);
      alert('Không thể tải bài viết');
      router.push('/blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleFeaturedImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFeaturedImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setFeaturedImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadFeaturedImage = async (): Promise<string | null> => {
    if (!featuredImageFile) return formData.featuredImage || null;

    try {
      const result = await uploadApi.uploadFile(featuredImageFile, 'blog');
      // The response structure includes data array with uploaded files
      if (result.status === 'success' && result.data && result.data.length > 0) {
        return result.data[0].secureUrl;
      }
      return null;
    } catch (err) {
      console.error('Error uploading featured image:', err);
      throw new Error('Không thể tải ảnh tiêu đề lên');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || submitting) return;

    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Vui lòng điền đầy đủ tiêu đề và nội dung');
      return;
    }

    try {
      setSubmitting(true);
      
      // Upload featured image if new image is selected
      let featuredImage = formData.featuredImage;
      if (featuredImageFile) {
        const uploadedImageUrl = await uploadFeaturedImage();
        featuredImage = uploadedImageUrl || undefined;
      }

      const blogData = {
        ...formData,
        featuredImage,
      };

      let result;
      if (isEdit && blogId) {
        result = await blogApi.updateBlog(blogId, blogData);
      } else {
        result = await blogApi.createBlog(blogData);
      }

      router.push(`/blogs/${result.id}`);
    } catch (err) {
      console.error('Error saving blog:', err);
      alert(isEdit ? 'Không thể cập nhật bài viết' : 'Không thể tạo bài viết');
    } finally {
      setSubmitting(false);
    }
  };

  // Show loading while checking authentication or fetching blog data
  if (userLoading || loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If not logged in (and not loading), this should not render
  // because useEffect will redirect to login
  if (!user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {isEdit ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
          </h1>
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu đề *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhập tiêu đề bài viết"
              required
            />
          </div>

          {/* Featured Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ảnh tiêu đề (hiển thị ở đầu bài viết)
            </label>
            <div className="space-y-3">
              {featuredImagePreview && (
                <div className="relative inline-block">
                  <img
                    src={featuredImagePreview}
                    alt="Featured Image Preview"
                    className="w-64 h-32 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFeaturedImagePreview('');
                      setFeaturedImageFile(null);
                      setFormData({ ...formData, featuredImage: '' });
                    }}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              
              <label className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
                <Upload size={20} className="text-gray-500" />
                <span className="text-gray-600">Chọn ảnh tiêu đề</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFeaturedImageChange}
                  className="hidden"
                />
              </label>
              <p className="text-sm text-gray-500">
                Ảnh này sẽ hiển thị ở đầu bài viết và trong danh sách blog
              </p>
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nội dung *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={12}
              placeholder="Viết nội dung bài viết..."
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Bạn có thể sử dụng HTML đơn giản để định dạng văn bản
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting || !formData.title.trim() || !formData.content.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>{isEdit ? 'Đang cập nhật...' : 'Đang tạo...'}</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>{isEdit ? 'Cập nhật' : 'Tạo bài viết'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlogForm;
