"use client";
import React from 'react';

interface ProfileCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ title, children, className = "" }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
        {title}
      </h2>
      {children}
    </div>
  );
};

export default ProfileCard;
