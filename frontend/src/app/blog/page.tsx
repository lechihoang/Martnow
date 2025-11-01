'use client';

import React, { useState, useEffect } from 'react';
import BlogList from '../../components/BlogList';
import { useAuthContext } from '../../contexts/AuthContext';
import { User } from '../../types/entities';
import { getUserProfile } from '@/lib/api';

export default function BlogsPage() {
  const { user } = useAuthContext();
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only fetch if user id changes, not on every user object update
    const userId = user?.id;

    setLoading(true);
    if (userId) {
      getUserProfile()
        .then(profile => {
          setUserProfile(profile);
        })
        .catch(() => {
          setUserProfile(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setUserProfile(null);
      setLoading(false);
    }
  }, [user?.id]); // Only depend on user.id, not the entire user object

  return (
    <BlogList userProfile={userProfile} profileLoading={loading} />
  );
}
