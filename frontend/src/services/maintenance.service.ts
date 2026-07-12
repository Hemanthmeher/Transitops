import api from './api';
import { MaintenanceLog, ApiResponse, PaginatedResponse } from '../types';

class MaintenanceService {
  async findAll(params?: { page?: number; limit?: number; status?: string; vehicleId?: number }) {
    const { data } = await api.get<PaginatedResponse<MaintenanceLog>>('/maintenance', { params });
    return data;
  }

  async findById(id: number) {
    const { data } = await api.get<ApiResponse<MaintenanceLog>>(`/maintenance/${id}`);
    return data.data;
  }

  async create(maintenanceData: { vehicleId: number; description: string; type: string; scheduledDate?: string; cost?: number; notes?: string }) {
    const { data } = await api.post<ApiResponse<MaintenanceLog>>('/maintenance', maintenanceData);
    return data.data;
  }

  async update(id: number, maintenanceData: Partial<MaintenanceLog>) {
    const { data } = await api.put<ApiResponse<MaintenanceLog>>(`/maintenance/${id}`, maintenanceData);
    return data.data;
  }

  async delete(id: number) {
    const { data } = await api.delete<ApiResponse<null>>(`/maintenance/${id}`);
    return data;
  }
}

export const maintenanceService = new MaintenanceService();
