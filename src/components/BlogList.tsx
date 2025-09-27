'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, User, Plus, Edit, Trash2 } from 'lucide-react';
import { blogApi } from '../lib/api';
import { BlogResponseDto } from '../types/dtos';

interface BlogListProps {
  userProfile: any;
}

const BlogList: React.FC<BlogListProps> = ({ userProfile }) => {
  const [allBlogs, setAllBlogs] = useState<BlogResponseDto[]>([]);
  const [userBlogs, setUserBlogs] = useState<BlogResponseDto[]>([]);
  const [latestBlogs, setLatestBlogs] = useState<BlogResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBlogs();
  }, [userProfile]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const data = await blogApi.getBlogs();
      setAllBlogs(data);

      if (userProfile && userProfile.id) {
        // Lọc blog của user hiện tại
        const userOwnBlogs = data.filter(blog => blog.author.id === userProfile.id);
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
  };

  const handleDeleteBlog = async (blogId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return;

    try {
      await blogApi.deleteBlog(blogId);
      fetchBlogs(); // Refresh data
    } catch (err) {
      console.error('Error deleting blog:', err);
      alert('Không thể xóa bài viết. Vui lòng thử lại.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={fetchBlogs}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
          <h2 className="text-lg font-semibold text-gray-900 mb-4 hover:text-blue-600 transition-colors duration-200 line-clamp-2">
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
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
            >
              <Edit size={14} />
              Chỉnh sửa
            </Link>
            <button
              onClick={(e) => {
                e.preventDefault();
                handleDeleteBlog(blog.id);
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
    <div className="min-h-screen bg-gray-50 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Blog
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl">
                Khám phá những bài viết thú vị, chia sẻ kiến thức và trải nghiệm từ cộng đồng Foodee
              </p>
            </div>
            {userProfile && (
              <Link
                href="/blog/create"
                className="flex items-center space-x-3 px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <Plus size={20} />
                <span>Tạo bài viết</span>
              </Link>
            )}
          </div>
        </div>

        {/* Phần 1: Blog của user hiện tại */}
        {userProfile && userBlogs.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Bài viết của bạn</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userBlogs.map((blog) => (
                <BlogCard key={blog.id} blog={blog} showActions={true} />
              ))}
            </div>
          </div>
        )}

        {/* Phần 2: Blog mới nhất */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {userProfile && userBlogs.length > 0 ? 'Bài viết mới nhất' : 'Tất cả bài viết'}
          </h2>

          {latestBlogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestBlogs.map((blog) => (
                <BlogCard key={blog.id} blog={blog} showActions={false} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full mx-auto mb-8 flex items-center justify-center">
                <span className="text-blue-500 text-6xl">📝</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Chưa có bài viết nào</h3>
              <p className="text-gray-600 mb-6 text-lg">Hãy là người đầu tiên chia sẻ câu chuyện và kiến thức của bạn!</p>
              <div className="inline-flex items-center gap-3 bg-blue-100 text-blue-800 px-6 py-3 rounded-full text-lg font-medium">
                🚀 Bắt đầu viết blog ngay hôm nay
              </div>
            </div>
          )}
        </div>
    </div>
  );
};

export default BlogList;
