import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
}

const sizeClasses = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8', 
  lg: 'h-12 w-12'
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  message = 'Đang tải...',
  className = ''
}) => {
  return (
    <div className={`flex justify-center items-center min-h-[200px] ${className}`}>
      <div className="text-center">
        <div 
          className={`animate-spin rounded-full border-b-2 border-blue-500 mx-auto mb-4 ${sizeClasses[size]}`}
        />
        <p className="text-lg text-gray-600">{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
