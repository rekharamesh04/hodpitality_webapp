// Brand Colors
export const BRAND_COLORS = {
  primary: '#2563EB',
  primaryHover: '#1D4ED8',
  primaryLight: '#DBEAFE',
  secondary: '#0F172A',
  accent: '#06B6D4',
  success: '#22C55E',
  danger: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
} as const;

// Status Types
export const STATUS_TYPES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  CONFIRMED: 'confirmed',
  CHECKED_IN: 'checked_in',
  CHECKED_OUT: 'checked_out',
} as const;

// User Roles
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff',
  VIEWER: 'viewer',
} as const;

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_LONG: 'MMMM dd, yyyy',
  DISPLAY_TIME: 'MMM dd, yyyy HH:mm',
  API: 'yyyy-MM-dd',
  TIME: 'HH:mm',
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    VERIFY_OTP: '/auth/verify-otp',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  DASHBOARD: '/dashboard',
  HOSPITALITY: '/hospitality',
  GUESTS: '/guests',
  CHECKINS: '/checkins',
  REGISTRATIONS: '/registrations',
  VENUES: '/venues',
  EVENTS: '/events',
  STAFF: '/staff',
  REPORTS: '/reports',
  ANALYTICS: '/analytics',
  NOTIFICATIONS: '/notifications',
  SETTINGS: '/settings',
} as const;

// Query Keys
export const QUERY_KEYS = {
  DASHBOARD: ['dashboard'],
  HOSPITALITY: ['hospitality'],
  GUESTS: ['guests'],
  GUEST_DETAIL: (id: string) => ['guests', id],
  CHECKINS: ['checkins'],
  REGISTRATIONS: ['registrations'],
  VENUES: ['venues'],
  EVENTS: ['events'],
  STAFF: ['staff'],
  REPORTS: ['reports'],
  ANALYTICS: ['analytics'],
  NOTIFICATIONS: ['notifications'],
  SETTINGS: ['settings'],
  USER: ['user'],
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'entryflow_auth_token',
  REFRESH_TOKEN: 'entryflow_refresh_token',
  USER: 'entryflow_user',
  THEME: 'entryflow_theme',
  SIDEBAR_STATE: 'entryflow_sidebar_collapsed',
} as const;

// Chart Colors
export const CHART_COLORS = {
  PRIMARY: '#2563EB',
  SECONDARY: '#06B6D4',
  SUCCESS: '#22C55E',
  WARNING: '#F59E0B',
  DANGER: '#EF4444',
  INFO: '#3B82F6',
  PURPLE: '#A855F7',
  PINK: '#EC4899',
} as const;

// Toast Duration
export const TOAST_DURATION = 3000;

// Animation Durations
export const ANIMATION = {
  FAST: 0.15,
  NORMAL: 0.25,
  SLOW: 0.35,
} as const;

export * from './navigation';
export * from './mock-data';
