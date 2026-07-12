import api from './api';

export const authService = {
  async login(email: string, password: string, rememberMe: boolean = false) {
    const { data } = await api.post('/auth/login', { email, password, rememberMe });
    return data.data;
  },

  async register(userData: { email: string; password: string; name: string; role?: string }) {
    const { data } = await api.post('/auth/register', userData);
    return data.data;
  },

  async getProfile() {
    const { data } = await api.get('/auth/profile');
    return data.data;
  },

  async forgotPassword(email: string) {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data.data;
  },

  async resetPassword(token: string, newPassword: string) {
    const { data } = await api.post('/auth/reset-password', { token, newPassword });
    return data.data;
  },

  async changePassword(currentPassword: string, newPassword: string) {
    const { data } = await api.post('/auth/change-password', { currentPassword, newPassword });
    return data.data;
  },

  async getAllUsers(page: number = 1, limit: number = 10) {
    const { data } = await api.get('/auth/users', { params: { page, limit } });
    return data;
  },

  async updateUserRole(userId: number, role: string, isActive?: boolean) {
    const { data } = await api.patch(`/auth/users/${userId}/role`, { role, isActive });
    return data.data;
  },

  async deleteUser(userId: number) {
    const { data } = await api.delete(`/auth/users/${userId}`);
    return data;
  },
};
