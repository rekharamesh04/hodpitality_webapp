import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { STORAGE_KEYS, API_ENDPOINTS } from '@/constants';
import { mockAdapter } from './mock-adapter';

// Endpoints that run without a session — a 401 here means "request rejected",
// not "your session expired", so it must not trigger the global logout redirect.
const UNAUTHENTICATED_PATHS: string[] = Object.values(API_ENDPOINTS.AUTH).filter(
  (path) => path !== API_ENDPOINTS.AUTH.ME && path !== API_ENDPOINTS.AUTH.LOGOUT
);

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
      // TEMP: local-only sessions have no real backend to talk to, so every
      // request is served from the in-memory mock backend instead of the
      // network — this is what keeps the app free of 401s while there's no
      // real login. Remove once real backend auth is wired up.
      if ((localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) ?? '').startsWith('local-')) {
        config.adapter = mockAdapter;
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
    const requestUrl = error.config?.url ?? '';
    const isUnauthenticatedRoute = UNAUTHENTICATED_PATHS.some((path) => requestUrl.includes(path));
    // TEMP: login is currently local-only (no real backend session — see the
    // login page), so a 401 here just means "this fake token isn't a real
    // Cognito token," not "your session expired." Don't force-logout for it.
    const isLocalSession = typeof window !== 'undefined'
      && (localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) ?? '').startsWith('local-');
    if (status === 401 && !isUnauthenticatedRoute && !isLocalSession) {
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
