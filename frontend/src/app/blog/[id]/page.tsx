'use client';

import React, { useState, useEffect } from 'react';
import BlogDetail from '../../../components/BlogDetail';
import { useAuthContext } from '../../../contexts/AuthContext';
import { UserProfile } from '@/types/auth';
import { getUserProfile } from '@/lib/api';

interface BlogDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { user, loading: authLoading } = useAuthContext();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
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
    const fetchProfile = async () => {
      const userId = user?.id;

      if (userId) {
        setProfileLoading(true);
        try {
          const profile = await getUserProfile();
          setUserProfile(profile);
        } catch {
          setUserProfile(null);
        } finally {
          setProfileLoading(false);
        }
      } else {
        setUserProfile(null);
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [user?.id]);

  if (!blogId) {
    return (
      <div className="py-8">
        <div className="text-center py-12">
          <p className="text-red-500">ID blog không hợp lệ</p>
        </div>
      </div>
    );
  }

  return <BlogDetail blogId={blogId} userProfile={userProfile} profileLoading={authLoading || profileLoading} />;
}
