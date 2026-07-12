interface StatusBadgeProps {
  status: string;
  className?: string;
}

const colorMap: Record<string, string> = {
  AVAILABLE: 'bg-emerald-100 text-emerald-800',
  ON_TRIP: 'bg-blue-100 text-blue-800',
  IN_SHOP: 'bg-amber-100 text-amber-800',
  RETIRED: 'bg-gray-100 text-gray-800',
  EXPIRED: 'bg-red-100 text-red-800',
  SUSPENDED: 'bg-red-100 text-red-800',
  PENDING: 'bg-amber-100 text-amber-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-emerald-100 text-emerald-800',
  CANCELLED: 'bg-red-100 text-red-800',
  OPEN: 'bg-amber-100 text-amber-800',
  ROUTINE: 'bg-blue-100 text-blue-800',
  REPAIR: 'bg-orange-100 text-orange-800',
  INSPECTION: 'bg-purple-100 text-purple-800',
  EMERGENCY: 'bg-red-100 text-red-800',
};

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const colorClass = colorMap[status] || 'bg-gray-100 text-gray-800';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass} ${className}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}
