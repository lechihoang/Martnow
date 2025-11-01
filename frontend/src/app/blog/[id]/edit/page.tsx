'use client';

import React, { useState, useEffect } from 'react';
import BlogForm from '../../../../components/BlogForm';
import Container from '../../../../components/Container';
import LoadingSpinner from '../../../../components/ui/LoadingSpinner';

interface EditBlogPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditBlogPage({ params }: EditBlogPageProps) {
  const [blogId, setBlogId] = useState<number | null>(null);

  useEffect(() => {
    const getParams = async () => {
      const { id } = await params;
      const idNum = parseInt(id);
      if (!isNaN(idNum)) {
        setBlogId(idNum);
      } else {
        console.error('Invalid blog ID:', id);
      }
    };
    getParams();
  }, [params]);

  // Show loading while params are loading
  if (blogId === null) {
    return (
      <Container>
        <div className="min-h-screen py-8">
          <div className="max-w-4xl mx-auto px-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200 px-6 py-6">
                <h1 className="text-2xl font-bold text-gray-900">Chỉnh sửa bài viết</h1>
              </div>
              <LoadingSpinner size="lg" message="Đang tải..." />
            </div>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <BlogForm blogId={blogId} />
    </Container>
  );
}
