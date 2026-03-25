import { create } from 'zustand';
import { api } from '../lib/api';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('access_token'),
  isAuthenticated: !!localStorage.getItem('access_token'),
  isLoading: !!localStorage.getItem('access_token'),

  login: (token, user) => {
    localStorage.setItem('access_token', token);
    set({ token, user, isAuthenticated: true });
  },

  logout: async () => {
    try {
      if (localStorage.getItem('access_token')) {
        await api.post('/auth/logout');
      }
    } catch (e) {
      console.error(e);
    }
    localStorage.removeItem('access_token');
    set({ token: null, user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    if (!localStorage.getItem('access_token')) {
      set({ isAuthenticated: false, isLoading: false });
      return;
    }
    
    set({ isLoading: true });
    try {
      const { data } = await api.get('/auth/user');
      set({ user: data, isAuthenticated: true });
    } catch {
      localStorage.removeItem('access_token');
      set({ token: null, user: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },
}));
