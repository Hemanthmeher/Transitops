export type Role = 'ADMIN' | 'MANAGER' | 'DISPATCHER' | 'DRIVER' | 'SAFETY_OFFICER' | 'FINANCIAL_ANALYST';

export interface User {
  id: number;
  email: string;
  name: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  rememberMe?: boolean;
}

export type VehicleStatus = 'AVAILABLE' | 'ON_TRIP' | 'IN_SHOP' | 'RETIRED' | 'DEPLOYED';

export interface Vehicle {
  id: number;
  plateNumber: string;
  make: string;
  model: string;
  year: number;
  capacity: number;
  status: VehicleStatus;
  type?: string;
  fuelType?: string;
  mileage?: number;
  region?: string;
  createdAt: string;
  updatedAt: string;
  _count?: { trips: number; maintenanceLogs: number; fuelLogs: number };
  trips?: Trip[];
  maintenanceLogs?: MaintenanceLog[];
  fuelLogs?: FuelLog[];
}

export type DriverStatus = 'AVAILABLE' | 'ON_TRIP' | 'SUSPENDED' | 'OFF_DUTY';

export interface Driver {
  id: number;
  licenseNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status: DriverStatus;
  licenseExpiry?: string;
  experience?: number;
  safetyScore?: number;
  createdAt: string;
  updatedAt: string;
  _count?: { trips: number };
  trips?: Trip[];
}

export type TripStatus = 'REQUESTED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Trip {
  id: number;
  vehicleId: number;
  driverId: number;
  origin: string;
  destination: string;
  status: TripStatus;
  cargoWeight?: number;
  cargoType?: string;
  revenue?: number;
  description?: string;
  scheduledDate: string;
  startTime?: string;
  completedDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  vehicle?: { id: number; plateNumber: string; make: string; model: string };
  driver?: { id: number; firstName: string; lastName: string };
  fuelLogs?: FuelLog[];
}

export type MaintenanceStatus = 'OPEN' | 'DUE_SOON' | 'COMPLETED' | 'CANCELLED';
export type MaintenanceType = 'SCHEDULED' | 'UNSCHEDULED' | 'EMERGENCY';

export interface MaintenanceLog {
  id: number;
  vehicleId: number;
  type: MaintenanceType;
  description: string;
  status: MaintenanceStatus;
  scheduledDate: string;
  completedDate?: string;
  cost?: number;
  notes?: string;
  reminderSent?: boolean;
  createdAt: string;
  updatedAt: string;
  vehicle?: { id: number; plateNumber: string; make: string; model: string };
}

export interface FuelLog {
  id: number;
  vehicleId: number;
  tripId?: number;
  date: string;
  liters: number;
  costPerLiter: number;
  totalCost: number;
  station?: string;
  fuelType?: string;
  odometer?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  vehicle?: { id: number; plateNumber: string };
  trip?: { id: number; origin: string; destination: string };
}

export type ExpenseCategory = 'MAINTENANCE' | 'FUEL' | 'TOLL' | 'PARKING' | 'INSURANCE' | 'REPAIRS' | 'MISC' | 'OTHER';

export interface Expense {
  id: number;
  vehicleId?: number;
  tripId?: number;
  category: ExpenseCategory;
  description: string;
  amount: number;
  date: string;
  receiptUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  vehicle?: { id: number; plateNumber: string };
}

export interface DashboardStats {
  totalVehicles: number;
  availableVehicles: number;
  inShopVehicles: number;
  deployedVehicles: number;
  totalDrivers: number;
  availableDrivers: number;
  activeTrips: number;
  completedTrips: number;
  todayTrips: number;
  pendingTrips: number;
  monthlyFuelCost: number;
  monthlyExpenseCost: number;
  fleetUtilization: number;
  recentTrips: Trip[];
  maintenanceAlerts: { id: number; description: string; status: string; scheduledDate: string; vehicle: { id: number; plateNumber: string } }[];
  vehicleStatusDistribution: { status: string; count: number }[];
  driverStatusDistribution: { status: string; count: number }[];
  tripStatusDistribution: { status: string; count: number }[];
}

export interface ReportData {
  trips: { total: number; completed: number; cancelled: number; onTrip: number; averageRevenue: number };
  fuel: { totalCost: number; totalLiters: number; averageCostPerLiter: number };
  expenses: { totalCost: number; byCategory: { category: string; total: number }[] };
  revenue: { total: number; net: number; profit: number };
  fleetUtilization: number;
  vehiclePerformance: { id: number; vehicle: string; totalTrips: number; completedTrips: number; totalRevenue: number; totalFuelCost: number; totalLiters: number }[];
  chartData: {
    tripsOverTime: { date: string; count: number; revenue: number }[];
    expensesByCategory: { category: string; total: number }[];
    fuelCostOverTime: { date: string; cost: number; liters: number }[];
  };
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface ApiError {
  success: boolean;
  message: string;
  errors?: { field: string; message: string }[];
}

export interface MonthlySummary {
  totalCost: number;
  totalLiters?: number;
  totalEntries: number;
  avgCostPerLiter?: number;
  byCategory?: { category: string; total: number }[];
}
