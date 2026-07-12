import api from './api';
import { Vehicle, PaginatedResponse } from '../types';

export const vehicleService = {
  async findAll(params?: Record<string, any>) {
    const { data } = await api.get<PaginatedResponse<Vehicle>>('/vehicles', { params });
    return data;
  },

  async findById(id: number) {
    const { data } = await api.get(`/vehicles/${id}`);
    return data.data;
  },

  async create(vehicleData: Partial<Vehicle>) {
    const { data } = await api.post('/vehicles', vehicleData);
    return data.data;
  },

  async update(id: number, vehicleData: Partial<Vehicle>) {
    const { data } = await api.put(`/vehicles/${id}`, vehicleData);
    return data.data;
  },

  async delete(id: number) {
    const { data } = await api.delete(`/vehicles/${id}`);
    return data;
  },

  async getAvailable() {
    const { data } = await api.get('/vehicles/available');
    return data.data;
  },

  async getStats() {
    const { data } = await api.get('/vehicles/stats');
    return data.data;
  },
};
