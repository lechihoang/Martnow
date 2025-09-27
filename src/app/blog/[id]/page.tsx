'use client';

import React, { useState, useEffect } from 'react';
import BlogDetail from '../../../components/BlogDetail';
import Container from '../../../components/Container';
import { useAuth } from '../../../hooks/useAuth';

interface BlogDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [blogId, setBlogId] = useState<number | null>(null);

  useEffect(() => {
    const getParams = async () => {
      const { id } = await params;
      const idNum = parseInt(id);
      if (!isNaN(idNum)) {
        setBlogId(idNum);
      }
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (user) {
      setUserProfile({
        id: user.id,
        name: user.email || 'User',
        username: user.email?.split('@')[0] || 'user',
        email: user.email || '',
        avatar: user.user_metadata?.avatar_url,
        role: 'BUYER'
      });
    }
  }, [user]);

  if (!blogId) {
    return (
      <Container>
        <div className="text-center py-12">
          <p className="text-red-500">ID blog không hợp lệ</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <BlogDetail blogId={blogId} userProfile={userProfile} />
    </Container>
  );
}
