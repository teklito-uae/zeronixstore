import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.70.153:8000';
export const STORAGE_URL = `${API_URL}/storage`;

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
