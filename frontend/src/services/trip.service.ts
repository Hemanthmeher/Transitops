import api from './api';
import { Trip, ApiResponse, PaginatedResponse } from '../types';

class TripService {
  async findAll(params?: { page?: number; limit?: number; status?: string; vehicleId?: number; driverId?: number; startDate?: string; endDate?: string }) {
    const { data } = await api.get<PaginatedResponse<Trip>>('/trips', { params });
    return data;
  }

  async findById(id: number) {
    const { data } = await api.get<ApiResponse<Trip>>(`/trips/${id}`);
    return data.data;
  }

  async create(tripData: { vehicleId: number; driverId: number; origin: string; destination: string; cargoWeight: number; notes?: string }) {
    const { data } = await api.post<ApiResponse<Trip>>('/trips', tripData);
    return data.data;
  }

  async updateStatus(id: number, status: string, notes?: string) {
    const { data } = await api.patch<ApiResponse<Trip>>(`/trips/${id}/status`, { status, notes });
    return data.data;
  }

  async getActive() {
    const { data } = await api.get<ApiResponse<Trip[]>>('/trips/active');
    return data.data;
  }
}

export const tripService = new TripService();
