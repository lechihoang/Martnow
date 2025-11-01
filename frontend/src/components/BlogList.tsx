'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, User, Plus, Edit, Trash2 } from 'lucide-react';
import { blogApi } from '../lib/api';
import { BlogResponseDto } from '../types/dtos';
import { UserProfile } from '@/types/auth';
import { LoadingSpinner, ConfirmDialog } from './ui';
import toast from 'react-hot-toast';

interface BlogListProps {
  userProfile: UserProfile | null;
  profileLoading?: boolean;
}

const BlogList: React.FC<BlogListProps> = ({ userProfile, profileLoading = false }) => {
  const [userBlogs, setUserBlogs] = useState<BlogResponseDto[]>([]);
  const [latestBlogs, setLatestBlogs] = useState<BlogResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await blogApi.getBlogs();

      const userId = userProfile?.id;
      if (userId) {
        // Lọc blog của user hiện tại
        const userOwnBlogs = data.filter(blog => blog.author.id === userId);
        setUserBlogs(userOwnBlogs);
      } else {
        setUserBlogs([]);
      }

      // Lấy các blog mới nhất (bao gồm cả blog của user)
      setLatestBlogs(data.slice(0, 6)); // Giới hạn 6 blog mới nhất
    } catch (err) {
      setError('Không thể tải danh sách blog');
      console.error('Error fetching blogs:', err);
    } finally {
      setLoading(false);
    }
  }, [userProfile?.id]); // Only depend on userProfile.id, not the entire object

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const handleDeleteBlog = async (blogId: number) => {
    try {
      await blogApi.deleteBlog(blogId);
      toast.success('Đã xóa bài viết thành công');
      fetchBlogs(); // Refresh data
    } catch (err) {
      console.error('Error deleting blog:', err);
      toast.error('Không thể xóa bài viết. Vui lòng thử lại.');
    } finally {
      setConfirmDelete(null);
    }
  };

  if (loading || profileLoading) {
    return (
      <div className="py-12 flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" message="Đang tải danh sách blog..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
        <button
          onClick={fetchBlogs}
          className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
        >
          Thử lại
        </button>
      </div>
    );
  }

  // Component để render blog card
  const BlogCard = ({ blog, showActions = false }: { blog: BlogResponseDto; showActions?: boolean }) => (
    <article className="bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-gray-400">
      {/* Image */}
      <Link href={`/blog/${blog.id}`} className="block">
        <div className="relative h-48 bg-gray-100 overflow-hidden group">
          {(blog.featuredImage || blog.imageUrl) ? (
            <Image
              src={blog.featuredImage || blog.imageUrl || ''}
              alt={blog.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <div className="text-gray-400 text-4xl">📖</div>
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-6">
        <Link href={`/blog/${blog.id}`}>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 hover:text-emerald-600 transition-colors duration-200 line-clamp-2">
            {blog.title}
          </h2>
        </Link>

        {/* Meta Information */}
        <div className="flex items-center gap-6 text-gray-600 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <User size={16} />
            <span className="font-medium">{blog.author.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={16} />
            <span className="font-medium">
              {new Date(blog.createdAt).toLocaleDateString('vi-VN')}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className="flex gap-2 mt-4">
            <Link
              href={`/blog/${blog.id}/edit`}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-emerald-100 text-emerald-700 rounded-md hover:bg-emerald-200 transition-colors"
            >
              <Edit size={14} />
              Chỉnh sửa
            </Link>
            <button
              onClick={(e) => {
                e.preventDefault();
                setConfirmDelete(blog.id);
              }}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
            >
              <Trash2 size={14} />
              Xóa
            </button>
          </div>
        )}
      </div>
    </article>
  );

  return (
    <div className="min-h-screen py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Blog
              </h1>
              <p className="text-gray-600">
                Khám phá những bài viết thú vị, chia sẻ kiến thức và trải nghiệm từ cộng đồng
              </p>
            </div>
            {userProfile && (
              <Link
                href="/blog/create"
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium whitespace-nowrap"
              >
                <Plus size={20} />
                <span>Tạo bài viết</span>
              </Link>
            )}
          </div>
        </div>

        {/* Phần 1: Blog của user hiện tại */}
        {userProfile && userBlogs.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Bài viết của bạn</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userBlogs.map((blog) => (
                <BlogCard key={blog.id} blog={blog} showActions={true} />
              ))}
            </div>
          </div>
        )}

        {/* Phần 2: Blog mới nhất */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Bài viết mới nhất
          </h2>

          {latestBlogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestBlogs.map((blog) => (
                <BlogCard key={blog.id} blog={blog} showActions={false} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
              <div className="w-20 h-20 bg-emerald-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-emerald-600 text-4xl">📝</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có bài viết nào</h3>
              <p className="text-gray-600 mb-4">Hãy là người đầu tiên chia sẻ câu chuyện và kiến thức của bạn!</p>
              {userProfile && (
                <Link
                  href="/blog/create"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                >
                  <Plus size={20} />
                  Tạo bài viết đầu tiên
                </Link>
              )}
            </div>
          )}
        </div>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && handleDeleteBlog(confirmDelete)}
        title="Xóa bài viết"
        message="Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
      />
    </div>
  );
};

export default BlogList;
