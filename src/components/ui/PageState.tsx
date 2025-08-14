import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import ErrorDisplay from './ErrorDisplay';

interface PageStateProps {
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  onRetry?: () => void;
  loadingMessage?: string;
  className?: string;
  children?: React.ReactNode;
}

const EmptyState: React.FC<{ message: string; icon?: React.ReactNode }> = ({ 
  message, 
  icon 
}) => (
  <div className="flex flex-col justify-center items-center min-h-[200px] space-y-4">
    {icon || (
      <svg 
        className="w-16 h-16 text-gray-400 mx-auto" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={1} 
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" 
        />
      </svg>
    )}
    <div className="text-center">
      <h3 className="text-lg font-medium text-gray-900 mb-2">Không có dữ liệu</h3>
      <p className="text-gray-600">{message}</p>
    </div>
  </div>
);

const PageState: React.FC<PageStateProps> = ({
  loading = false,
  error = null,
  empty = false,
  emptyMessage = 'Không tìm thấy dữ liệu',
  emptyIcon,
  onRetry,
  loadingMessage = 'Đang tải...',
  className = '',
  children
}) => {
  // Priority: loading -> error -> empty -> children
  if (loading) {
    return (
      <LoadingSpinner 
        size="lg" 
        message={loadingMessage}
        className={`min-h-[400px] ${className}`}
      />
    );
  }

  if (error) {
    return (
      <ErrorDisplay 
        error={error}
        onRetry={onRetry}
        className={`min-h-[400px] ${className}`}
      />
    );
  }

  if (empty) {
    return (
      <div className={className}>
        <EmptyState message={emptyMessage} icon={emptyIcon} />
      </div>
    );
  }

  return <div className={className}>{children}</div>;
};

export default PageState;
