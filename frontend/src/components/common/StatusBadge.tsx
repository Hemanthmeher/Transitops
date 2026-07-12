import React from 'react';
import { statusBadgeClass } from '../../utils/formatters';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';
  const label = status.replace(/_/g, ' ');

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${statusBadgeClass(status)} ${sizeClass}`}>
      {label}
    </span>
  );
};

export default StatusBadge;
