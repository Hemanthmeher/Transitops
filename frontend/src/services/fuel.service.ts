import api from './api';
import { FuelLog, ApiResponse, PaginatedResponse } from '../types';

class FuelService {
  async findAll(params?: { page?: number; limit?: number; vehicleId?: number; tripId?: number }) {
    const { data } = await api.get<PaginatedResponse<FuelLog>>('/fuel', { params });
    return data;
  }

  async findById(id: number) {
    const { data } = await api.get<ApiResponse<FuelLog>>(`/fuel/${id}`);
    return data.data;
  }

  async create(fuelData: { vehicleId: number; tripId?: number; liters: number; costPerLiter: number; totalCost: number; date?: string; notes?: string }) {
    const { data } = await api.post<ApiResponse<FuelLog>>('/fuel', fuelData);
    return data.data;
  }

  async update(id: number, fuelData: Partial<FuelLog>) {
    const { data } = await api.put<ApiResponse<FuelLog>>(`/fuel/${id}`, fuelData);
    return data.data;
  }

  async delete(id: number) {
    const { data } = await api.delete<ApiResponse<null>>(`/fuel/${id}`);
    return data;
  }
}

export const fuelService = new FuelService();
