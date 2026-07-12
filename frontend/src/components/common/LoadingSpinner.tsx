import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', message }) => {
  const sizeClasses = {
    sm: 'h-5 w-5 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div
        className={`animate-spin rounded-full border-blue-500 border-t-transparent ${sizeClasses[size]}`}
      />
      {message && <p className="mt-3 text-sm text-gray-500">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
