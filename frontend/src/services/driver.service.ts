import api from './api';
import { Driver, ApiResponse, PaginatedResponse } from '../types';

class DriverService {
  async findAll(params?: { page?: number; limit?: number; status?: string; search?: string }) {
    const { data } = await api.get<PaginatedResponse<Driver>>('/drivers', { params });
    return data;
  }

  async findById(id: number) {
    const { data } = await api.get<ApiResponse<Driver>>(`/drivers/${id}`);
    return data.data;
  }

  async create(driverData: Omit<Driver, 'id' | 'createdAt' | 'updatedAt' | 'status' | '_count'>) {
    const { data } = await api.post<ApiResponse<Driver>>('/drivers', driverData);
    return data.data;
  }

  async update(id: number, driverData: Partial<Driver>) {
    const { data } = await api.put<ApiResponse<Driver>>(`/drivers/${id}`, driverData);
    return data.data;
  }

  async delete(id: number) {
    const { data } = await api.delete<ApiResponse<null>>(`/drivers/${id}`);
    return data;
  }

  async getAvailable() {
    const { data } = await api.get<ApiResponse<Driver[]>>('/drivers/available');
    return data.data;
  }
}

export const driverService = new DriverService();
