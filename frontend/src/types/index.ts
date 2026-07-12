// ─── Enums ──────────────────────────────────────────────────────────────────

export type UserRole = 'ADMIN' | 'MANAGER' | 'DISPATCHER' | 'DRIVER';
export type VehicleStatus = 'AVAILABLE' | 'ON_TRIP' | 'IN_SHOP' | 'RETIRED';
export type DriverStatus = 'AVAILABLE' | 'ON_TRIP' | 'EXPIRED' | 'SUSPENDED';
export type TripStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type MaintenanceType = 'ROUTINE' | 'REPAIR' | 'INSPECTION' | 'EMERGENCY';
export type MaintenanceStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type ExpenseCategory = 'TOLL' | 'PARKING' | 'FOOD' | 'ACCOMMODATION' | 'SUPPLIES' | 'OTHER';

// ─── Entities ───────────────────────────────────────────────────────────────

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  isActive?: boolean;
  createdAt?: string;
}

export interface Vehicle {
  id: number;
  plateNumber: string;
  make: string;
  model: string;
  year: number;
  capacity: number;
  status: VehicleStatus;
  createdAt: string;
  updatedAt: string;
  _count?: { trips: number; maintenanceLogs: number };
}

export interface Driver {
  id: number;
  licenseNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: DriverStatus;
  createdAt: string;
  updatedAt: string;
  _count?: { trips: number };
}

export interface Trip {
  id: number;
  vehicleId: number;
  driverId: number;
  origin: string;
  destination: string;
  cargoWeight: number;
  status: TripStatus;
  startTime: string | null;
  endTime: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  vehicle?: Pick<Vehicle, 'id' | 'plateNumber' | 'make' | 'model'>;
  driver?: Pick<Driver, 'id' | 'firstName' | 'lastName'>;
}

export interface MaintenanceLog {
  id: number;
  vehicleId: number;
  description: string;
  type: MaintenanceType;
  scheduledDate: string | null;
  completedDate: string | null;
  cost: number;
  status: MaintenanceStatus;
  notes: string | null;
  createdAt: string;
  vehicle?: Pick<Vehicle, 'id' | 'plateNumber' | 'make' | 'model'>;
}

export interface FuelLog {
  id: number;
  vehicleId: number;
  tripId: number | null;
  liters: number;
  costPerLiter: number;
  totalCost: number;
  date: string;
  notes: string | null;
  vehicle?: Pick<Vehicle, 'id' | 'plateNumber'>;
  trip?: Pick<Trip, 'id' | 'origin' | 'destination'>;
}

export interface Expense {
  id: number;
  tripId: number | null;
  category: ExpenseCategory;
  amount: number;
  description: string;
  date: string;
  receiptUrl: string | null;
  trip?: Pick<Trip, 'id' | 'origin' | 'destination'>;
}

// ─── API Response Types ─────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ─── Dashboard Types ────────────────────────────────────────────────────────

export interface DashboardStats {
  vehicles: { total: number; available: number; onTrip: number; inShop: number };
  drivers: { total: number; available: number; onTrip: number };
  trips: { active: number; today: number };
  maintenance: { pending: number };
  finances: { fuelCostToday: number; expensesToday: number };
}

export interface StatusChartData {
  name: string;
  count: number;
}
