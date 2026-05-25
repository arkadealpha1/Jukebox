import { api } from './api';
import type { User } from '@/types';

interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  register(username: string, email: string, password: string): Promise<AuthResponse> {
    return api.post<AuthResponse>('/auth/register', { username, email, password });
  },

  login(email: string, password: string): Promise<AuthResponse> {
    return api.post<AuthResponse>('/auth/login', { email, password });
  },

  getMe(): Promise<User> {
    return api.get<User>('/auth/me');
  },
};
