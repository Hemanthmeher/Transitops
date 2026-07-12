import api from './api';
import { Driver, PaginatedResponse } from '../types';

export const driverService = {
  async findAll(params?: Record<string, any>) {
    const { data } = await api.get<PaginatedResponse<Driver>>('/drivers', { params });
    return data;
  },

  async findById(id: number) {
    const { data } = await api.get(`/drivers/${id}`);
    return data.data;
  },

  async create(driverData: Partial<Driver>) {
    const { data } = await api.post('/drivers', driverData);
    return data.data;
  },

  async update(id: number, driverData: Partial<Driver>) {
    const { data } = await api.put(`/drivers/${id}`, driverData);
    return data.data;
  },

  async updateStatus(id: number, status: string) {
    const { data } = await api.patch(`/drivers/${id}/status`, { status });
    return data.data;
  },

  async delete(id: number) {
    const { data } = await api.delete(`/drivers/${id}`);
    return data;
  },

  async getAvailable() {
    const { data } = await api.get('/drivers/available');
    return data.data;
  },

  async getStats() {
    const { data } = await api.get('/drivers/stats');
    return data.data;
  },
};
