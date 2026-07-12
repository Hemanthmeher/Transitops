import api from './api';
import { FuelLog, PaginatedResponse, MonthlySummary } from '../types';

export const fuelService = {
  async findAll(params?: Record<string, any>) {
    const { data } = await api.get<PaginatedResponse<FuelLog>>('/fuel', { params });
    return data;
  },

  async findById(id: number) {
    const { data } = await api.get(`/fuel/${id}`);
    return data.data;
  },

  async create(fuelData: Partial<FuelLog>) {
    const { data } = await api.post('/fuel', fuelData);
    return data.data;
  },

  async update(id: number, fuelData: Partial<FuelLog>) {
    const { data } = await api.put(`/fuel/${id}`, fuelData);
    return data.data;
  },

  async delete(id: number) {
    const { data } = await api.delete(`/fuel/${id}`);
    return data;
  },

  async getMonthlySummary() {
    const { data } = await api.get('/fuel/monthly-summary');
    return data.data as MonthlySummary;
  },
};
