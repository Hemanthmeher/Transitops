export const formatDate = (date: string | Date): string => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date: string | Date): string => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

export const formatWeight = (kg: number): string => {
  return `${formatNumber(kg)} kg`;
};

export const formatLiters = (liters: number): string => {
  return `${formatNumber(liters)} L`;
};

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    AVAILABLE: 'green',
    ON_TRIP: 'blue',
    IN_SHOP: 'yellow',
    RETIRED: 'gray',
    SUSPENDED: 'red',
    COMPLETED: 'green',
    CANCELLED: 'red',
    OPEN: 'yellow',
    SCHEDULED: 'blue',
    UNSCHEDULED: 'orange',
    EMERGENCY: 'red',
  };
  return colors[status] || 'gray';
};

export const statusBadgeClass = (status: string): string => {
  const classes: Record<string, string> = {
    AVAILABLE: 'bg-green-100 text-green-800 border-green-200',
    ON_TRIP: 'bg-blue-100 text-blue-800 border-blue-200',
    IN_SHOP: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    RETIRED: 'bg-gray-100 text-gray-800 border-gray-200',
    SUSPENDED: 'bg-red-100 text-red-800 border-red-200',
    COMPLETED: 'bg-green-100 text-green-800 border-green-200',
    CANCELLED: 'bg-red-100 text-red-800 border-red-200',
    OPEN: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  };
  return classes[status] || 'bg-gray-100 text-gray-800 border-gray-200';
};
