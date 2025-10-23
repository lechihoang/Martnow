"use client";
import React from 'react';
import Container from '@/components/Container';

interface ProfileLayoutProps {
  children: React.ReactNode;
}

const ProfileLayout: React.FC<ProfileLayoutProps> = ({ 
  children
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
