import React from 'react';
import { useNavigate } from 'react-router-dom';

interface EmptyStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  actionPath?: string;
  icon?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  actionLabel,
  actionPath,
  icon = '📭',
}) => {
  const navigate = useNavigate();

  return (
    <div className="text-center py-12">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">{message}</p>
      {actionLabel && actionPath && (
        <button onClick={() => navigate(actionPath)} className="btn-primary">
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
