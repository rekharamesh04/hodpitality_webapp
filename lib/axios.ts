import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { STORAGE_KEYS } from '@/constants';

// Allow callers to signal that the Access Token should be used instead of the ID Token
declare module 'axios' {
  interface AxiosRequestConfig {
    useAccessToken?: boolean;
  }
}

export const BASE_URL = 'https://x8nrv9hcrf.execute-api.ap-south-1.amazonaws.com/dev';
const API_KEY = 'entryflow-secret-key-2026!@';

/** Normalise any Lambda response into a plain array regardless of wrapping shape. */
export function unwrapList<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (raw && typeof raw === 'object') {
    const r = raw as Record<string, unknown>;
    if (Array.isArray(r.data))    return r.data as T[];
    if (Array.isArray(r.entries)) return r.entries as T[];
    if (Array.isArray(r.items))   return r.items as T[];
  }
  return [];
}

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
  },
});

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      // PUT /settings/password requires the Cognito Access Token, not the ID Token
      const key = (config as any).useAccessToken ? STORAGE_KEYS.ACCESS_TOKEN : STORAGE_KEYS.AUTH_TOKEN;
      const token = localStorage.getItem(key);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    // Log all POST/PUT requests so invite payloads are visible in the browser console
    if (config.method === 'post' || config.method === 'put') {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, config.data);
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log POST/PUT responses so we can see what the backend confirms
    if (response.config.method === 'post' || response.config.method === 'put') {
      console.log(`[API] ← ${response.status} ${response.config.url}`, response.data);
    }
    return response;
  },
  async (error: AxiosError<{ error?: string; message?: string }>) => {
    const status = error.response?.status;
    if (status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        window.location.href = '/login';
      }
    }
    // Preserve the backend error message for callers
    const backendMsg = error.response?.data?.error ?? error.response?.data?.message;
    if (backendMsg && error.message !== backendMsg) {
      (error as any).backendMessage = backendMsg;
    }
    return Promise.reject(error);
  }
);

export default api;
