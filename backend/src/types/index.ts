import { Request } from 'express';
import { Role } from '@prisma/client';

export interface JwtPayload {
  userId: number;
  email: string;
  role: Role;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DateRange {
  start: string;
  end: string;
}

export interface DashboardStats {
  totalVehicles: number;
  availableVehicles: number;
  inShopVehicles: number;
  totalDrivers: number;
  availableDrivers: number;
  activeTrips: number;
  completedTrips: number;
  monthlyFuelCost: number;
  monthlyExpenseCost: number;
  recentTrips: any[];
  vehicleStatusDistribution: { status: string; count: number }[];
  driverStatusDistribution: { status: string; count: number }[];
}

export interface ReportData {
  trips: {
    total: number;
    completed: number;
    cancelled: number;
    onTrip: number;
    averageRevenue: number;
  };
  fuel: {
    totalCost: number;
    totalLiters: number;
    averageCostPerLiter: number;
  };
  expenses: {
    totalCost: number;
    byCategory: { category: string; total: number }[];
  };
  revenue: {
    total: number;
    net: number;
  };
  chartData: {
    tripsOverTime: { date: string; count: number; revenue: number }[];
    expensesByCategory: { category: string; total: number }[];
    fuelCostOverTime: { date: string; cost: number; liters: number }[];
  };
  exportUrl?: string;
}
