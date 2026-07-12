import api from './api';
import { ReportData } from '../types';

export const reportService = {
  async getReport(startDate?: string, endDate?: string) {
    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const { data } = await api.get('/reports', { params });
    return data.data as ReportData;
  },

  async exportCsv(type: string = 'trips', startDate?: string, endDate?: string) {
    const params: Record<string, string> = { type };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const { data } = await api.get('/reports/export/csv', { params, responseType: 'text' });
    return data;
  },
};
