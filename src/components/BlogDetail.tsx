'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Calendar, User, MessageCircle, Edit, Trash2 } from 'lucide-react';
import { blogApi } from '../lib/api';
import useUser from '../hooks/useUser';
import CommentSection from './CommentSection';
import VoteButtons from './VoteButtons';

interface Blog {
  id: number;
  title: string;
  content: string;
  imageUrl?: string;
  featuredImage?: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: number;
    name: string;
  };
  comments: any[];
  upvoteCount?: number;
  downvoteCount?: number;
  userVote?: 'up' | 'down' | null;
}

interface BlogDetailProps {
  blogId: number;
}

const BlogDetail: React.FC<BlogDetailProps> = ({ blogId }) => {
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  useEffect(() => {
    fetchBlog();
  }, [blogId]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const data = await blogApi.getBlog(blogId);
      setBlog(data);
    } catch (err) {
      setError('Không thể tải bài viết');
      console.error('Error fetching blog:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBlog = async () => {
    if (!blog || !window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return;

    try {
      await blogApi.deleteBlog(blog.id);
      window.location.href = '/blogs';
    } catch (err) {
      console.error('Error deleting blog:', err);
      alert('Không thể xóa bài viết');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error || 'Không tìm thấy bài viết'}</p>
      </div>
    );
  }

  const isAuthor = user?.id === blog.author.id;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <article className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header Image */}
        {(blog.featuredImage || blog.imageUrl) && (
          <div className="relative h-64 md:h-80">
            <Image
              src={blog.featuredImage || blog.imageUrl || ''}
              alt={blog.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                {blog.title}
              </h1>
              
              {isAuthor && (
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => window.location.href = `/blogs/${blog.id}/edit`}
                    className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                    title="Chỉnh sửa"
                  >
                    <Edit size={20} />
                  </button>
                  <button
                    onClick={handleDeleteBlog}
                    className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                    title="Xóa bài viết"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              )}
            </div>

            {/* Meta info */}
            <div className="flex items-center text-gray-600 space-x-6">
              <div className="flex items-center">
                <User size={16} className="mr-2" />
                {blog.author.name}
              </div>
              <div className="flex items-center">
                <Calendar size={16} className="mr-2" />
                {new Date(blog.createdAt).toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
              {blog.createdAt !== blog.updatedAt && (
                <div className="text-sm text-gray-500">
                  (Cập nhật: {new Date(blog.updatedAt).toLocaleDateString('vi-VN')})
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div 
            className="prose prose-lg max-w-none mb-8"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          {/* Vote Buttons */}
          <div className="flex justify-between items-center py-4 border-t border-b border-gray-200 mb-8">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Bạn thấy bài viết này như thế nào?</span>
            </div>
            <VoteButtons
              blogId={blog.id}
              upvoteCount={blog.upvoteCount || 0}
              downvoteCount={blog.downvoteCount || 0}
              userVote={blog.userVote}
              orientation="horizontal"
            />
          </div>

          {/* Comments Section */}
          <div className="border-t border-gray-200 pt-8">
            <div className="flex items-center mb-6">
              <MessageCircle size={24} className="mr-2 text-blue-600" />
              <h3 className="text-xl font-semibold text-gray-900">
                Bình luận ({blog.comments.length})
              </h3>
            </div>

            <CommentSection blogId={blog.id} />
          </div>
        </div>
      </article>
    </div>
  );
};

export default BlogDetail;
