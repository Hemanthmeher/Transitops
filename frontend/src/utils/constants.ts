export const ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  DISPATCHER: 'DISPATCHER',
  DRIVER: 'DRIVER',
} as const;

export const VEHICLE_STATUS_COLORS: Record<string, string> = {
  AVAILABLE: 'success',
  ON_TRIP: 'info',
  IN_SHOP: 'warning',
  RETIRED: 'neutral',
} as const;

export const DRIVER_STATUS_COLORS: Record<string, string> = {
  AVAILABLE: 'success',
  ON_TRIP: 'info',
  EXPIRED: 'danger',
  SUSPENDED: 'danger',
} as const;

export const TRIP_STATUS_COLORS: Record<string, string> = {
  PENDING: 'warning',
  IN_PROGRESS: 'info',
  COMPLETED: 'success',
  CANCELLED: 'danger',
} as const;

export const MAINTENANCE_STATUS_COLORS: Record<string, string> = {
  OPEN: 'warning',
  IN_PROGRESS: 'info',
  COMPLETED: 'success',
  CANCELLED: 'neutral',
} as const;

export const EXPENSE_CATEGORIES = [
  { value: 'TOLL', label: 'Toll' },
  { value: 'PARKING', label: 'Parking' },
  { value: 'FOOD', label: 'Food' },
  { value: 'ACCOMMODATION', label: 'Accommodation' },
  { value: 'SUPPLIES', label: 'Supplies' },
  { value: 'OTHER', label: 'Other' },
] as const;

export const MAINTENANCE_TYPES = [
  { value: 'ROUTINE', label: 'Routine' },
  { value: 'REPAIR', label: 'Repair' },
  { value: 'INSPECTION', label: 'Inspection' },
  { value: 'EMERGENCY', label: 'Emergency' },
] as const;

export const PAGE_LIMIT = 10;
