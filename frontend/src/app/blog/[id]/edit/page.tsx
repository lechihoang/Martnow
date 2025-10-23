'use client';

import React, { useState, useEffect } from 'react';
import BlogForm from '../../../../components/BlogForm';
import Container from '../../../../components/Container';
import { useAuth } from '../../../../hooks/useAuth';
import { userApi } from '../../../../lib/api';
import { UserProfile } from '../../../../types/auth';

interface EditBlogPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditBlogPage({ params }: EditBlogPageProps) {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [blogId, setBlogId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          const profile = await userApi.getProfile();
          if (profile && profile.id) {
            const newProfile = {
              id: profile.id,
              name: profile.name,
              username: profile.username,
              email: profile.email,
              avatar: profile.avatar,
              role: profile.role
            };
            setUserProfile(newProfile);
          } else {
            setUserProfile(null);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    };

    fetchUserProfile();
  }, [user]);

  // Show loading while params or auth are loading
  if (loading || blogId === null) {
    return (
      <Container>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <BlogForm blogId={blogId} userProfile={userProfile} loading={loading} />
    </Container>
  );
}
