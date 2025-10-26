import React from 'react';
import { User } from 'lucide-react';

interface DefaultAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const DefaultAvatar: React.FC<DefaultAvatarProps> = ({
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
    xl: 'w-14 h-14',
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gray-300 flex items-center justify-center ${className}`}
    >
      <User className={`${iconSizes[size]} text-white`} />
    </div>
  );
};

export default DefaultAvatar;
