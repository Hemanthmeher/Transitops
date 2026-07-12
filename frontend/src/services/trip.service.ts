import api from './api';
import { Trip, PaginatedResponse } from '../types';

export const tripService = {
  async findAll(params?: Record<string, any>) {
    const { data } = await api.get<PaginatedResponse<Trip>>('/trips', { params });
    return data;
  },

  async findById(id: number) {
    const { data } = await api.get(`/trips/${id}`);
    return data.data;
  },

  async create(tripData: Partial<Trip>) {
    const { data } = await api.post('/trips', tripData);
    return data.data;
  },

  async assign(id: number) {
    const { data } = await api.patch(`/trips/${id}/assign`);
    return data.data;
  },

  async startTrip(id: number) {
    const { data } = await api.patch(`/trips/${id}/start`);
    return data.data;
  },

  async complete(id: number, notes?: string) {
    const { data } = await api.patch(`/trips/${id}/complete`, { notes });
    return data.data;
  },

  async cancel(id: number, notes?: string) {
    const { data } = await api.patch(`/trips/${id}/cancel`, { notes });
    return data.data;
  },

  async delete(id: number) {
    const { data } = await api.delete(`/trips/${id}`);
    return data;
  },
};
