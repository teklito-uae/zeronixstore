import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000`;
const apiBase = API_URL.endsWith('/api') ? API_URL : `${API_URL}/api`;

export const STORAGE_URL = `${API_URL}/storage`;

export const api = axios.create({
  baseURL: apiBase,
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
