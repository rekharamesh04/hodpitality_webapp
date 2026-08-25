// Brand Colors
export const BRAND_COLORS = {
  primary: '#0F766E',
  primaryHover: '#0D5F58',
  primaryLight: '#CCFBF1',
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
    REGISTER: '/auth/register',
    GOOGLE: '/auth/google',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    FORGOT_PASSWORD: '/auth/forgot-password',
    VERIFY_OTP: '/auth/verify-otp',
    RESET_PASSWORD: '/auth/reset-password',
    RESPOND_CHALLENGE: '/auth/respond-challenge',
  },
  SETTINGS: {
    PROFILE: '/settings/profile',
    ORGANISATION: '/settings/organisation',
    NOTIFICATIONS: '/settings/notifications',
    PASSWORD: '/settings/password',
  },
  RESELLERS: '/resellers',
  COMPANIES: '/companies',
  GUESTS: '/guests',
  CUSTOMERS: '/customers',
  CHECK_INS: '/check-ins',
  EVENTS: '/events',
  VENUES: '/venues',
  STAFF: '/staff',
  APPOINTMENTS: '/appointments',
  CALENDAR: '/calendar',
  DASHBOARD: {
    ACTIVITY: '/dashboard/activity',
    CHARTS: (type: string) => `/dashboard/charts/${type}`,
  },
  REPORTS: {
    DASHBOARD_STATS: '/reports/dashboard-stats',
    DAILY: '/reports/daily',
    GUEST_ARRIVALS: '/reports/guest-arrivals',
    MONTHLY_EVENTS: '/reports/monthly-events',
    REVENUE_TREND: '/reports/revenue-trend',
    EXPORT: '/reports/export',
  },
  UPLOADS: {
    PRESIGNED_URL: '/uploads/presigned-url',
  },
  NOTIFICATIONS: '/notifications',
  HOSPITALITY: '/hospitality',
  REGISTRATIONS: '/registrations',
  SERVICES: '/services',
} as const;

// Query Keys
export const QUERY_KEYS = {
  DASHBOARD: ['dashboard'],
  HOSPITALITY: ['hospitality'],
  GUESTS: ['guests'],
  GUEST_DETAIL: (id: string) => ['guests', id],
  CUSTOMERS: ['customers'],
  CUSTOMER_DETAIL: (id: string) => ['customers', id],
  CHECKINS: ['check-ins'],
  CHECKIN_STATS: ['check-ins', 'stats'],
  REGISTRATIONS: ['registrations'],
  VENUES: ['venues'],
  VENUE_DETAIL: (id: string) => ['venues', id],
  EVENTS: ['events'],
  EVENT_DETAIL: (id: string) => ['events', id],
  EVENT_ATTENDEES: (id: string) => ['events', id, 'attendees'],
  UPCOMING_EVENTS: ['events', 'upcoming'],
  STAFF: ['staff'],
  STAFF_DETAIL: (id: string) => ['staff', id],
  APPOINTMENTS: ['appointments'],
  CALENDAR: ['calendar'],
  REPORTS: ['reports'],
  ANALYTICS: ['analytics'],
  NOTIFICATIONS: ['notifications'],
  SETTINGS: ['settings'],
  USER: ['user'],
  RESELLERS: ['resellers'],
  RESELLER_DETAIL: (id: string) => ['resellers', id],
  COMPANIES: ['companies'],
  COMPANY_DETAIL: (id: string) => ['companies', id],
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'entryflow_auth_token',
  ACCESS_TOKEN: 'entryflow_access_token',
  REFRESH_TOKEN: 'entryflow_refresh_token',
  USER: 'entryflow_user',
  THEME: 'entryflow_theme',
  SIDEBAR_STATE: 'entryflow_sidebar_collapsed',
} as const;

// Chart Colors
export const CHART_COLORS = {
  PRIMARY: '#0F766E',
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
