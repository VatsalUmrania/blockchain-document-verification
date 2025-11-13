import api from './api';
import { LoginResponse } from '../types/auth';

export const siweService = {
  async getNonce(): Promise<{ nonce: string }> {
    const response = await api.get('/auth/nonce');
    return response.data;
  },

  async login(message: string, signature: string, address: string): Promise<LoginResponse> {
    const response = await api.post('/auth/login', {
      message,
      signature,
      address
    });
    return response.data;
  },

  async logout(): Promise<{ success: boolean }> {
    const response = await api.post('/auth/logout');
    return response.data;
  }
};
