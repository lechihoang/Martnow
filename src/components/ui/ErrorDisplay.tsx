import React from 'react';

interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  retryText?: string;
  className?: string;
  showIcon?: boolean;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  retryText = 'Thử lại',
  className = '',
  showIcon = true
}) => {
  return (
    <div className={`flex flex-col justify-center items-center min-h-[200px] space-y-4 ${className}`}>
      {showIcon && (
        <div className="text-red-500">
          <svg 
            className="w-16 h-16 mx-auto mb-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
        </div>
      )}
      
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Có lỗi xảy ra</h3>
        <p className="text-red-600 mb-4 max-w-md">{error}</p>
      </div>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
                     transition-colors duration-200 focus:outline-none focus:ring-2 
                     focus:ring-blue-500 focus:ring-offset-2"
        >
          {retryText}
        </button>
      )}
    </div>
  );
};

export default ErrorDisplay;
