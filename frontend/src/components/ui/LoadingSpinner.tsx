import React from 'react';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  className?: string;
  variant?: 'default' | 'fullscreen' | 'inline';
  showMessage?: boolean;
}

const sizeClasses = {
  xs: 'h-4 w-4',
  sm: 'h-6 w-6',
  md: 'h-10 w-10',
  lg: 'h-14 w-14',
  xl: 'h-20 w-20'
};

const textSizeClasses = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl'
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  message = 'Đang tải...',
  className = '',
  variant = 'default',
  showMessage = true
}) => {
  const spinnerElement = (
    <div className="relative inline-block mx-auto">
      {/* Outer ring */}
      <div
        className={`${sizeClasses[size]} rounded-full border-4 border-gray-200 absolute top-0 left-0`}
      />
      {/* Animated ring */}
      <div
        className={`${sizeClasses[size]} rounded-full border-4 border-transparent border-t-emerald-500 animate-spin`}
      />
    </div>
  );

  if (variant === 'inline') {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <div className="relative inline-block">
          <div className={`${sizeClasses[size]} rounded-full border-2 border-gray-200 absolute top-0 left-0`} />
          <div className={`${sizeClasses[size]} rounded-full border-2 border-transparent border-t-emerald-500 animate-spin`} />
        </div>
        {showMessage && <span className={`${textSizeClasses[size]} text-gray-600`}>{message}</span>}
      </div>
    );
  }

  if (variant === 'fullscreen') {
    return (
      <div className={`fixed inset-0 bg-white z-50 flex flex-col justify-center items-center ${className}`}>
        <div className="text-center flex flex-col items-center">
          <div className="mb-4">
            {spinnerElement}
          </div>
          {showMessage && (
            <p className={`${textSizeClasses[size]} text-gray-600 font-medium`}>
              {message}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`flex flex-col justify-center items-center min-h-[200px] bg-white ${className}`}>
      <div className="text-center flex flex-col items-center">
        <div className="mb-4">
          {spinnerElement}
        </div>
        {showMessage && (
          <p className={`${textSizeClasses[size]} text-gray-600 font-medium`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;
