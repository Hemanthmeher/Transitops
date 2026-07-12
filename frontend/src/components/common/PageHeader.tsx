import React from 'react';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionPath?: string;
  onAction?: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actionLabel,
  actionPath,
  onAction,
}) => {
  const navigate = useNavigate();

  const handleAction = () => {
    if (onAction) {
      onAction();
    } else if (actionPath) {
      navigate(actionPath);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
      </div>
      {actionLabel && (actionPath || onAction) && (
        <button onClick={handleAction} className="btn-primary">
          + {actionLabel}
        </button>
      )}
    </div>
  );
};

export default PageHeader;
