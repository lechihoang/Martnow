'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, User, MessageCircle, Plus } from 'lucide-react';
import { blogApi } from '../lib/api';
import useUser from '../hooks/useUser';
import VoteButtons from './VoteButtons';

interface Blog {
  id: number;
  title: string;
  content: string;
  imageUrl?: string;
  featuredImage?: string;
  createdAt: string;
  author: {
    id: number;
    name: string;
  };
  comments: any[];
  upvoteCount?: number;
  downvoteCount?: number;
  userVote?: 'up' | 'down' | null;
}

const BlogList: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const data = await blogApi.getBlogs();
      setBlogs(data);
    } catch (err) {
      setError('Không thể tải danh sách blog');
      console.error('Error fetching blogs:', err);
    } finally {
      setLoading(false);
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-3xl font-bold text-gray-900">Blog</h1>
          {user && (
            <Link
              href="/blogs/create"
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
              <span>Tạo bài viết</span>
            </Link>
          )}
        </div>
        <p className="text-gray-600">Khám phá những bài viết thú vị từ cộng đồng</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map((blog) => (
          <Link key={blog.id} href={`/blogs/${blog.id}`} className="group">
            <article className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
              {/* Image */}
              <div className="relative h-48 bg-gray-100">
                {(blog.featuredImage || blog.imageUrl) ? (
                  <Image
                    src={blog.featuredImage || blog.imageUrl || ''}
                    alt={blog.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    <div className="text-blue-500 text-4xl">📖</div>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {blog.title}
                </h2>

                <p className="text-gray-600 mb-4 line-clamp-3">
                  {blog.content.replace(/<[^>]*>/g, '').slice(0, 150)}...
                </p>

                {/* Meta & Actions */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <User size={14} className="mr-1" />
                        {blog.author.name}
                      </div>
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-1" />
                        {new Date(blog.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <MessageCircle size={14} className="mr-1" />
                      {blog.comments.length}
                    </div>
                  </div>
                  
                  {/* Vote Buttons */}
                  <div className="flex justify-between items-center">
                    <VoteButtons
                      blogId={blog.id}
                      upvoteCount={blog.upvoteCount || 0}
                      downvoteCount={blog.downvoteCount || 0}
                      userVote={blog.userVote}
                      orientation="horizontal"
                    />
                  </div>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>

      {blogs.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có bài viết nào</h3>
          <p className="text-gray-600">Hãy là người đầu tiên chia sẻ câu chuyện của bạn!</p>
        </div>
      )}
    </div>
  );
};

export default BlogList;
