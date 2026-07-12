import api from './api';
import { Vehicle, ApiResponse, PaginatedResponse } from '../types';

class VehicleService {
  async findAll(params?: { page?: number; limit?: number; status?: string; search?: string }) {
    const { data } = await api.get<PaginatedResponse<Vehicle>>('/vehicles', { params });
    return data;
  }

  async findById(id: number) {
    const { data } = await api.get<ApiResponse<Vehicle>>(`/vehicles/${id}`);
    return data.data;
  }

  async create(vehicleData: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt' | 'status' | '_count'>) {
    const { data } = await api.post<ApiResponse<Vehicle>>('/vehicles', vehicleData);
    return data.data;
  }

  async update(id: number, vehicleData: Partial<Vehicle>) {
    const { data } = await api.put<ApiResponse<Vehicle>>(`/vehicles/${id}`, vehicleData);
    return data.data;
  }

  async delete(id: number) {
    const { data } = await api.delete<ApiResponse<null>>(`/vehicles/${id}`);
    return data;
  }

  async getAvailable() {
    const { data } = await api.get<ApiResponse<Vehicle[]>>('/vehicles/available');
    return data.data;
  }
}

export const vehicleService = new VehicleService();
