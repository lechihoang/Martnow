'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Save, X, Upload } from 'lucide-react';
import { blogApi, uploadApi, getUserProfile } from '../lib/api';
import { CreateBlogDto, UpdateBlogDto } from '../types/dtos';
import SimpleCommentEditor from './SimpleCommentEditor';
import { useAuthContext } from '../contexts/AuthContext';
import { User } from '../types/entities';
import LoadingSpinner from './ui/LoadingSpinner';
import toast from 'react-hot-toast';

interface BlogFormProps {
  blogId?: number;
}

type BlogData = CreateBlogDto;

const BlogForm: React.FC<BlogFormProps> = ({ blogId }) => {
  const { user, loading: authLoading } = useAuthContext();
  const [userProfile, setUserProfile] = useState<User | null>(null);
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

  // Fetch user profile when user is available
  useEffect(() => {
    const fetchProfile = async () => {
      if (user && user.id && user.email && user.aud === 'authenticated') {
        console.log('✅ User is authenticated, fetching profile...');
        try {
          const profile = await getUserProfile();
          console.log('📋 Profile fetched:', profile);
          setUserProfile(profile || null);
        } catch (error) {
          console.error('❌ Error fetching user profile:', error);
          setUserProfile(null);
        }
      } else if (!authLoading) {
        // Auth is done loading and no user - clear profile
        setUserProfile(null);
      }
    };

    fetchProfile();
  }, [user, authLoading]);

  // Handle redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      console.log('🚨 Redirecting to login - no user after auth loading');
      router.push('/auth/login');
    }
  }, [authLoading, user, router]);

  const fetchBlog = useCallback(async () => {
    if (!blogId) return;

    try {
      setLoading(true);
      const blog = await blogApi.getBlog(blogId);
      
      // Check if user is the author
      if (blog.author.id !== userProfile?.id) {
        toast.error('Bạn không có quyền chỉnh sửa bài viết này');
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
      toast.error('Không thể tải bài viết');
      router.push('/blog');
    } finally {
      setLoading(false);
    }
  }, [blogId, userProfile, router]);

  useEffect(() => {
    // Fetch blog data if in edit mode and user is available
    if (isEdit && blogId && userProfile) {
      fetchBlog();
    }
  }, [userProfile, blogId, isEdit, fetchBlog]);

  // Removed redirect useEffect - let component handle it in render

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
      toast.error('Vui lòng điền đầy đủ thông tin');
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
        toast.success('Cập nhật bài viết thành công!');
      } else {
        await blogApi.createBlog(submitData);
        toast.success('Tạo bài viết thành công!');
      }

      router.push('/blog');
    } catch (error) {
      console.error('Error submitting blog:', error);
      toast.error('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  // Show loading while auth is initializing or fetching blog data
  if (authLoading || loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-6">
              <h1 className="text-2xl font-bold text-gray-900">
                {isEdit ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
              </h1>
            </div>
            <LoadingSpinner size="lg" message={loading ? "Đang tải bài viết..." : "Đang xác thực..."} />
          </div>
        </div>
      </div>
    );
  }

  // Show loading if user exists but profile not loaded yet (redirect handled by useEffect)
  if (user && !userProfile) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-6">
              <h1 className="text-2xl font-bold text-gray-900">
                {isEdit ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
              </h1>
            </div>
            <LoadingSpinner size="lg" message="Đang tải thông tin..." />
          </div>
        </div>
      </div>
    );
  }

  // If no user after auth loading, show loading (redirect is happening)
  if (!user) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-6">
              <h1 className="text-2xl font-bold text-gray-900">
                {isEdit ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
              </h1>
            </div>
            <LoadingSpinner size="lg" message="Đang chuyển hướng..." />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isEdit ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
                </h1>
                <p className="text-gray-600 mt-1 text-sm">
                  {isEdit ? 'Cập nhật nội dung bài viết của bạn' : 'Chia sẻ kiến thức và trải nghiệm với cộng đồng'}
                </p>
              </div>
              <button
                onClick={() => router.push('/blog')}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
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
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-white hover:bg-gray-50 transition-colors">
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
                <SimpleCommentEditor
                  content={formData.content}
                  onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                  placeholder="Viết nội dung bài viết của bạn..."
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => router.push('/blog')}
                  className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
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
