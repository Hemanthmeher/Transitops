import api from './api';
import { Expense, PaginatedResponse, MonthlySummary } from '../types';

export const expenseService = {
  async findAll(params?: Record<string, any>) {
    const { data } = await api.get<PaginatedResponse<Expense>>('/expenses', { params });
    return data;
  },

  async findById(id: number) {
    const { data } = await api.get(`/expenses/${id}`);
    return data.data;
  },

  async create(expenseData: Partial<Expense>) {
    const { data } = await api.post('/expenses', expenseData);
    return data.data;
  },

  async update(id: number, expenseData: Partial<Expense>) {
    const { data } = await api.put(`/expenses/${id}`, expenseData);
    return data.data;
  },

  async delete(id: number) {
    const { data } = await api.delete(`/expenses/${id}`);
    return data;
  },

  async getMonthlySummary() {
    const { data } = await api.get('/expenses/monthly-summary');
    return data.data as MonthlySummary;
  },
};
