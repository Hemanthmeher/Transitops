export const ROLES = {
  ADMIN: 'ADMIN' as const,
  MANAGER: 'MANAGER' as const,
  DISPATCHER: 'DISPATCHER' as const,
  DRIVER: 'DRIVER' as const,
  SAFETY_OFFICER: 'SAFETY_OFFICER' as const,
  FINANCIAL_ANALYST: 'FINANCIAL_ANALYST' as const,
};

export const VEHICLE_STATUS = {
  AVAILABLE: 'AVAILABLE' as const,
  ON_TRIP: 'ON_TRIP' as const,
  IN_SHOP: 'IN_SHOP' as const,
  RETIRED: 'RETIRED' as const,
  DEPLOYED: 'DEPLOYED' as const,
};

export const DRIVER_STATUS = {
  AVAILABLE: 'AVAILABLE' as const,
  ON_TRIP: 'ON_TRIP' as const,
  SUSPENDED: 'SUSPENDED' as const,
  OFF_DUTY: 'OFF_DUTY' as const,
};

export const TRIP_STATUS = {
  REQUESTED: 'REQUESTED' as const,
  ASSIGNED: 'ASSIGNED' as const,
  IN_PROGRESS: 'IN_PROGRESS' as const,
  COMPLETED: 'COMPLETED' as const,
  CANCELLED: 'CANCELLED' as const,
};

export const MAINTENANCE_STATUS = {
  OPEN: 'OPEN' as const,
  DUE_SOON: 'DUE_SOON' as const,
  COMPLETED: 'COMPLETED' as const,
  CANCELLED: 'CANCELLED' as const,
};

export const MAINTENANCE_TYPES = {
  SCHEDULED: 'SCHEDULED' as const,
  UNSCHEDULED: 'UNSCHEDULED' as const,
  EMERGENCY: 'EMERGENCY' as const,
};

export const EXPENSE_CATEGORIES = {
  MAINTENANCE: 'MAINTENANCE' as const,
  FUEL: 'FUEL' as const,
  TOLL: 'TOLL' as const,
  PARKING: 'PARKING' as const,
  INSURANCE: 'INSURANCE' as const,
  REPAIRS: 'REPAIRS' as const,
  MISC: 'MISC' as const,
  OTHER: 'OTHER' as const,
};

export const PIE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

export const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: 'bg-green-100 text-green-800',
  ON_TRIP: 'bg-blue-100 text-blue-800',
  IN_SHOP: 'bg-yellow-100 text-yellow-800',
  RETIRED: 'bg-gray-100 text-gray-800',
  DEPLOYED: 'bg-purple-100 text-purple-800',
  SUSPENDED: 'bg-red-100 text-red-800',
  OFF_DUTY: 'bg-orange-100 text-orange-800',
  REQUESTED: 'bg-blue-100 text-blue-800',
  ASSIGNED: 'bg-indigo-100 text-indigo-800',
  IN_PROGRESS: 'bg-cyan-100 text-cyan-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  DUE_SOON: 'bg-orange-100 text-orange-800',
  OPEN: 'bg-yellow-100 text-yellow-800',
  SCHEDULED: 'bg-blue-100 text-blue-800',
  UNSCHEDULED: 'bg-orange-100 text-orange-800',
  EMERGENCY: 'bg-red-100 text-red-800',
};

export const ITEMS_PER_PAGE = 10;
