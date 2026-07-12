import api from './api';
import { User, ApiResponse } from '../types';

class AuthService {
  async login(email: string, password: string) {
    const { data } = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/login', { email, password });
    return data.data;
  }

  async register(registerData: { email: string; password: string; name: string; role?: string }) {
    const { data } = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/register', registerData);
    return data.data;
  }

  async getProfile() {
    const { data } = await api.get<ApiResponse<User>>('/auth/profile');
    return data.data;
  }
}

export const authService = new AuthService();
