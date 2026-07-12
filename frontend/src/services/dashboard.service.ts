import api from './api';
import { DashboardStats, ApiResponse, Trip, StatusChartData } from '../types';

class DashboardService {
  async getStats() {
    const { data } = await api.get<ApiResponse<DashboardStats>>('/dashboard/stats');
    return data.data;
  }

  async getRecentTrips() {
    const { data } = await api.get<ApiResponse<Trip[]>>('/dashboard/recent-trips');
    return data.data;
  }

  async getVehicleStatusDistribution() {
    const { data } = await api.get<ApiResponse<StatusChartData[]>>('/dashboard/vehicle-status');
    return data.data;
  }

  async getTripStatusSummary() {
    const { data } = await api.get<ApiResponse<StatusChartData[]>>('/dashboard/trip-status');
    return data.data;
  }
}

export const dashboardService = new DashboardService();
