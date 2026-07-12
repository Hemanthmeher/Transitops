import api from './api';
import { DashboardStats } from '../types';

export const dashboardService = {
  async getStats(filters?: { vehicleType?: string; region?: string; status?: string }) {
    const { data } = await api.get('/dashboard/stats', { params: filters });
    return data.data as DashboardStats;
  },
};
