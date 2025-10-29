'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Calendar, User, MessageCircle, Edit, Trash2 } from 'lucide-react';
import { blogApi } from '../lib/api';
import CommentSection from './CommentSection';
import VoteButtons from './VoteButtons';
import { BlogResponseDto } from '../types/dtos';
import { UserProfile } from '@/types/auth';
import { LoadingSpinner } from './ui';

interface BlogDetailProps {
  blogId: number;
  userProfile: UserProfile | null;
}

const BlogDetail: React.FC<BlogDetailProps> = ({ blogId, userProfile }) => {
  const [blog, setBlog] = useState<BlogResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBlog = useCallback(async () => {
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
  }, [blogId]);

  useEffect(() => {
    fetchBlog();
  }, [fetchBlog]);

  const handleDeleteBlog = async () => {
    if (!blog || !window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return;

    try {
      await blogApi.deleteBlog(blog.id);
      window.location.href = '/blog';
    } catch (err) {
      console.error('Error deleting blog:', err);
      alert('Không thể xóa bài viết');
    }
  };

  if (loading) {
    return (
      <div className="py-12 bg-white">
        <LoadingSpinner size="lg" message="Đang tải bài viết..." />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error || 'Không tìm thấy bài viết'}</p>
      </div>
    );
  }

  const isAuthor = userProfile?.id === blog.author.id.toString();

  return (
    <div className="py-8">
      <article className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                {blog.title}
              </h1>

              {isAuthor && (
                <div className="flex space-x-2 ml-4">
                  <div className="relative group">
                    <button
                      onClick={() => window.location.href = `/blog/${blog.id}/edit`}
                      className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                    >
                      <Edit size={20} />
                    </button>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                      Chỉnh sửa
                    </div>
                  </div>
                  <div className="relative group">
                    <button
                      onClick={handleDeleteBlog}
                      className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                      Xóa
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{blog.author.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(blog.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                <span>{blog.comments?.length || 0} bình luận</span>
              </div>
            </div>
          </div>

          {/* Featured Image - moved here after title and meta */}
          {(blog.featuredImage || blog.imageUrl) && (
            <div className="max-w-4xl mx-auto mb-8">
              <div className="relative h-64 md:h-80 rounded-lg overflow-hidden">
                <Image
                  src={blog.featuredImage || blog.imageUrl || ''}
                  alt={blog.title}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}

          {/* Content */}
          <div className="prose prose-lg max-w-4xl mx-auto mb-8" dangerouslySetInnerHTML={{ __html: blog.content }} />

          {/* Vote Buttons - moved to end of blog */}
          <div className="pt-6 border-t border-gray-200">
            <VoteButtons
              blogId={blog.id}
              upvoteCount={blog.upvoteCount || 0}
              downvoteCount={blog.downvoteCount || 0}
              userVote={blog.userVote}
              orientation="horizontal"
              userProfile={userProfile}
            />
          </div>
        </div>
      </article>

      {/* Comments Section */}
      <div className="mt-8">
        <CommentSection blogId={blog.id} userProfile={userProfile} />
      </div>
    </div>
  );
};

export default BlogDetail;
