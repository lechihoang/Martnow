'use client';

import React, { useState, useEffect } from 'react';
import BlogList from '../../components/BlogList';
import { useAuth } from '../../hooks/useAuth';

export default function BlogsPage() {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);

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

  return (
    <BlogList userProfile={userProfile} />
  );
}
