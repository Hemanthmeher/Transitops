import api from './api';
import { MaintenanceLog, PaginatedResponse } from '../types';

export const maintenanceService = {
  async findAll(params?: Record<string, any>) {
    const { data } = await api.get<PaginatedResponse<MaintenanceLog>>('/maintenance', { params });
    return data;
  },

  async findById(id: number) {
    const { data } = await api.get(`/maintenance/${id}`);
    return data.data;
  },

  async create(maintenanceData: Partial<MaintenanceLog>) {
    const { data } = await api.post('/maintenance', maintenanceData);
    return data.data;
  },

  async markDueSoon(id: number) {
    const { data } = await api.patch(`/maintenance/${id}/due-soon`);
    return data.data;
  },

  async complete(id: number, updateData?: { cost?: number; notes?: string }) {
    const { data } = await api.patch(`/maintenance/${id}/complete`, updateData || {});
    return data.data;
  },

  async cancel(id: number, notes?: string) {
    const { data } = await api.patch(`/maintenance/${id}/cancel`, { notes });
    return data.data;
  },

  async delete(id: number) {
    const { data } = await api.delete(`/maintenance/${id}`);
    return data;
  },

  async getAlerts() {
    const { data } = await api.get('/maintenance/alerts');
    return data.data;
  },
};
