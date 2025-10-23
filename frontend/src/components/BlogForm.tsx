'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Save, X, Upload } from 'lucide-react';
import { blogApi, uploadApi } from '../lib/api';
import { CreateBlogDto, UpdateBlogDto } from '../types/dtos';
import { UserProfile } from '../types/auth';

interface BlogFormProps {
  blogId?: number;
  userProfile: UserProfile | null;
  loading: boolean;
}

type BlogData = CreateBlogDto;

const BlogForm: React.FC<BlogFormProps> = ({ blogId, userProfile, loading: userLoading }) => {
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
  const router = useRouter();

  const isEdit = Boolean(blogId);

  const fetchBlog = useCallback(async () => {
    if (!blogId) return;

    try {
      setLoading(true);
      const blog = await blogApi.getBlog(blogId);
      
      // Check if user is the author
      if (blog.author.id !== userProfile?.id) {
        alert('Bạn không có quyền chỉnh sửa bài viết này');
        router.push('/blog');
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
      router.push('/blog');
    } finally {
      setLoading(false);
    }
  }, [blogId, userProfile, router]);

  useEffect(() => {
    // Wait for user loading to complete before checking authentication
    if (userLoading) {
      return;
    }

    // Add delay to prevent race condition with userProfile fetch
    const timeoutId = setTimeout(() => {
      if (!userProfile) {
        router.push('/auth/login');
        return;
      }
    }, 2000); // Increase timeout to 2 seconds

    if (isEdit && blogId && userProfile) {
      fetchBlog();
    }

    return () => clearTimeout(timeoutId);
  }, [userProfile, userLoading, blogId, isEdit, router, fetchBlog]);

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
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      setSubmitting(true);
      
      // Upload featured image if there's a new one
      let featuredImageUrl = formData.featuredImage;
      if (featuredImageFile) {
        const uploadedUrl = await uploadFeaturedImage();
        if (uploadedUrl) {
          featuredImageUrl = uploadedUrl;
        }
      }

      const submitData = {
        ...formData,
        featuredImage: featuredImageUrl,
      };

      if (isEdit && blogId) {
        await blogApi.updateBlog(blogId, submitData as UpdateBlogDto);
        alert('Cập nhật bài viết thành công!');
      } else {
        await blogApi.createBlog(submitData);
        alert('Tạo bài viết thành công!');
      }

      router.push('/blog');
    } catch (error) {
      console.error('Error submitting blog:', error);
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  if (userLoading || (!userProfile && !userLoading)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">
                  {isEdit ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
                </h1>
                <p className="text-blue-100 mt-2">
                  {isEdit ? 'Cập nhật nội dung bài viết của bạn' : 'Chia sẻ kiến thức và trải nghiệm với cộng đồng'}
                </p>
              </div>
              <button
                onClick={() => router.push('/blog')}
                className="p-2 text-blue-100 hover:text-white hover:bg-blue-600 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiêu đề bài viết *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập tiêu đề bài viết..."
                  required
                />
              </div>

              {/* Featured Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ảnh đại diện
                </label>
                <div className="space-y-4">
                  {featuredImagePreview && (
                    <div className="relative">
                      <Image
                        src={featuredImagePreview}
                        alt="Preview"
                        width={600}
                        height={192}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFeaturedImagePreview('');
                          setFeaturedImageFile(null);
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-4 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click để upload</span> hoặc kéo thả file
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF (MAX. 10MB)</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFeaturedImageChange}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nội dung bài viết *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={15}
                  placeholder="Viết nội dung bài viết của bạn..."
                  required
                />
                <p className="text-sm text-gray-500 mt-2">
                  Hỗ trợ HTML để định dạng văn bản
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => router.push('/blog')}
                  className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      {isEdit ? 'Cập nhật' : 'Tạo bài viết'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogForm;
