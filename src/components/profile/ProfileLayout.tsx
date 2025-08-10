"use client";
import React from 'react';
import Container from '@/components/Container';

interface ProfileLayoutProps {
  children: React.ReactNode;
  userRole: string;
  userId: string;
  isOwnProfile: boolean;
}

const ProfileLayout: React.FC<ProfileLayoutProps> = ({ 
  children, 
  userRole, 
  userId, 
  isOwnProfile 
}) => {
  return (
    <Container>
      <div className="py-8">
        {/* Main Content - Full Width */}
        <div className="w-full">
          {children}
        </div>
      </div>
    </Container>
  );
};

export default ProfileLayout;
