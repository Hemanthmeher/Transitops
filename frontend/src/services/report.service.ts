import api from './api';
import { ApiResponse } from '../types';

interface TripReport {
  summary: {
    totalTrips: number;
    completedTrips: number;
    cancelledTrips: number;
    activeTrips: number;
    totalFuelCost: number;
    totalExpenses: number;
    totalCargoMoved: number;
    averageCargoPerTrip: number;
  };
  trips: any[];
}

interface FuelReport {
  summary: {
    totalFuelLogs: number;
    totalLiters: number;
    totalCost: number;
    avgCostPerLiter: number;
  };
  fuelLogs: any[];
}

interface ExpenseReport {
  summary: {
    totalExpenses: number;
    totalAmount: number;
    byCategory: Record<string, number>;
  };
  expenses: any[];
}

class ReportService {
  async getTripReport(startDate?: string, endDate?: string) {
    const { data } = await api.get<ApiResponse<TripReport>>('/reports/trips', { params: { startDate, endDate } });
    return data.data;
  }

  async getFuelReport(startDate?: string, endDate?: string) {
    const { data } = await api.get<ApiResponse<FuelReport>>('/reports/fuel', { params: { startDate, endDate } });
    return data.data;
  }

  async getExpenseReport(startDate?: string, endDate?: string) {
    const { data } = await api.get<ApiResponse<ExpenseReport>>('/reports/expenses', { params: { startDate, endDate } });
    return data.data;
  }

  async getFleetUtilization(startDate?: string, endDate?: string) {
    const { data } = await api.get<ApiResponse<any[]>>('/reports/fleet-utilization', { params: { startDate, endDate } });
    return data.data;
  }

  async exportTripsCsv(startDate?: string, endDate?: string) {
    const response = await api.get('/reports/trips/export/csv', {
      params: { startDate, endDate },
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `trips-report-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

export const reportService = new ReportService();
