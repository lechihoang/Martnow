"use client";
import React from 'react';
import Container from '@/components/Container';
import ProfileSidebar from '@/components/profile/ProfileSidebar';

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
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="hidden md:block">
            <ProfileSidebar 
              userRole={userRole} 
              userId={userId} 
              isOwnProfile={isOwnProfile}
            />
          </div>
          
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {children}
          </div>
        </div>
      </div>
    </Container>
  );
};

export default ProfileLayout;
