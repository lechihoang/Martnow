'use client';

import React, { useState, useEffect } from 'react';
import BlogForm from '../../../components/BlogForm';
import Container from '../../../components/Container';
import { useAuth } from '../../../hooks/useAuth';
import { getUserProfile } from '../../../lib/api';
import { UserProfile } from '../../../types/auth';

export default function CreateBlogPage() {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user && user.id && user.email && user.aud === 'authenticated') {
        try {
          const profile = await getUserProfile();
          if (profile && profile.id) {
            setUserProfile(profile);
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

  if (loading) {
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
      <BlogForm userProfile={userProfile} loading={loading} />
    </Container>
  );
}
