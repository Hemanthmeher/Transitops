import api from './api';
import { Expense, ApiResponse, PaginatedResponse } from '../types';

class ExpenseService {
  async findAll(params?: { page?: number; limit?: number; tripId?: number; category?: string; startDate?: string; endDate?: string }) {
    const { data } = await api.get<PaginatedResponse<Expense>>('/expenses', { params });
    return data;
  }

  async findById(id: number) {
    const { data } = await api.get<ApiResponse<Expense>>(`/expenses/${id}`);
    return data.data;
  }

  async create(expenseData: { tripId?: number; category: string; amount: number; description: string; date?: string; receiptUrl?: string }) {
    const { data } = await api.post<ApiResponse<Expense>>('/expenses', expenseData);
    return data.data;
  }

  async update(id: number, expenseData: Partial<Expense>) {
    const { data } = await api.put<ApiResponse<Expense>>(`/expenses/${id}`, expenseData);
    return data.data;
  }

  async delete(id: number) {
    const { data } = await api.delete<ApiResponse<null>>(`/expenses/${id}`);
    return data;
  }
}

export const expenseService = new ExpenseService();
