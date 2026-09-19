import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | undefined | null, format: string = 'MMM dd, yyyy'): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—';
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthsFull = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  const month = months[d.getMonth()];
  const monthFull = monthsFull[d.getMonth()];
  const day = d.getDate();
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  
  return format
    .replace('MMMM', monthFull)
    .replace('MMM', month)
    .replace('dd', day.toString().padStart(2, '0'))
    .replace('yyyy', year.toString())
    .replace('HH', hours)
    .replace('mm', minutes);
}

/**
 * "YYYY-MM-DD" for the given moment in the user's LOCAL timezone. Use this instead of
 * `toISOString().slice(0, 10)`, which returns the UTC date — e.g. the previous day for
 * anyone in IST between midnight and 05:30.
 */
export function toLocalDateInput(date: string | Date = new Date()): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  const value = Number.isFinite(amount) ? amount : 0;
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: (currency || 'USD').toUpperCase(),
    }).format(value);
  } catch {
    // Unknown/invalid ISO code from the API — show the number rather than crash the page.
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  }
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function truncate(str: string, length: number = 50): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Semantic status buckets. Every class — including the `dark:` variants — is written out in
// full so Tailwind's source scanner generates it; never build these strings dynamically.
const STATUS_TONES = {
  success: 'text-green-700 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950/30 dark:border-green-800',
  neutral: 'text-gray-600 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-900/30 dark:border-gray-700',
  warning: 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/30 dark:border-amber-800',
  info:    'text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950/30 dark:border-blue-800',
  danger:  'text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950/30 dark:border-red-800',
  brand:   'text-indigo-700 bg-indigo-50 border-indigo-200 dark:text-indigo-300 dark:bg-indigo-950/40 dark:border-indigo-800',
} as const;

const STATUS_TONE_MAP: Record<string, keyof typeof STATUS_TONES> = {
  active: 'success',
  inactive: 'neutral',
  pending: 'warning',
  completed: 'info',
  cancelled: 'danger',
  confirmed: 'success',
  checked_in: 'info',
  checked_out: 'neutral',
  arrived: 'brand',
  on_site: 'success',
  no_show: 'danger',
  // Payment statuses reuse the same semantic buckets above — no new colors.
  paid: 'success',
  processing: 'warning',
  failed: 'danger',
  refunded: 'info',
  partially_refunded: 'brand',
};

/** Light + dark badge classes for any record/payment status. */
export function getStatusColor(status: string): string {
  const key = (status ?? '').toLowerCase().replace(/[\s-]/g, '_');
  return STATUS_TONES[STATUS_TONE_MAP[key] ?? 'neutral'];
}

export function generateQRCode(data: string): string {
  // In production, use a proper QR code library
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}`;
}

function csvCell(value: unknown): string {
  if (value == null) return '';
  const str = typeof value === 'object' ? JSON.stringify(value) : String(value);
  return /[",\r\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export function exportToCSV(data: any[], filename: string): void {
  if (!data.length) return;

  // Union of keys across all rows, so a field missing from the first row isn't dropped.
  const headers = Array.from(new Set(data.flatMap((row) => Object.keys(row ?? {}))));
  const csv = [
    headers.map(csvCell).join(','),
    ...data.map((row) => headers.map((header) => csvCell(row?.[header])).join(',')),
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
}

export function getRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  
  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return formatDate(d);
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function isValidPhone(phone: string): boolean {
  const re = /^[\d\s\-\+\(\)]+$/;
  return re.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Best-effort extraction of a Cognito-invitation warning from a POST /resellers or
 * POST /companies response. The record itself was created either way (2xx) — this only
 * checks a few plausible optional field names for a distinct "the invite didn't go out"
 * signal, without assuming a fixed schema. Returns null when the backend doesn't report one,
 * which is the common case.
 */
export function extractInvitationWarning(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;
  const r = data as Record<string, unknown>;
  const candidate = r._cognito_error ?? r.invitationError ?? r.invitation_error ?? r.inviteError ?? r.cognitoError ?? r.cognito_error ?? r.warning;
  return typeof candidate === 'string' && candidate.trim() ? candidate : null;
}

/** Maps a failed request into safe, user-facing copy — never surfaces raw backend error text or stack traces. */
export function getFriendlyErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  const err = error as { response?: { status?: number }; request?: unknown } | undefined;
  const status = err?.response?.status;
  if (status === 401) return 'Your session has expired. Please sign in again.';
  if (status === 403) return "You don't have permission to view this data.";
  if (status === 404) return 'The requested item could not be found.';
  if (status === 409) return 'This conflicts with existing data. Please refresh and try again.';
  if (status === 400) return 'The request was invalid. Please check the form and try again.';
  if (typeof status === 'number' && status >= 500) return 'The server encountered an error. Please try again shortly.';
  if (!err?.response && err?.request) return 'Network error — please check your connection and try again.';
  return fallback;
}

export interface DuplicatePersonConflict {
  /** Id of the person who already owns this email. */
  id: string;
  entityType: 'GUEST' | 'CUSTOMER';
  email?: string;
  message: string;
}

/**
 * One email belongs to exactly one person across guests and customers, so a create/update that
 * reuses one comes back as 409 carrying the existing record's id. Callers open that record
 * instead of inserting a duplicate row.
 */
export function getDuplicatePersonConflict(error: unknown): DuplicatePersonConflict | null {
  const response = (error as { response?: { status?: number; data?: unknown } } | undefined)?.response;
  if (response?.status !== 409) return null;
  const data = (response.data ?? {}) as Record<string, unknown>;
  const id = data.id ?? data.guestId ?? data.customerId;
  if (typeof id !== 'string' || !id) return null;
  return {
    id,
    entityType: data.entityType === 'CUSTOMER' ? 'CUSTOMER' : 'GUEST',
    email: typeof data.email === 'string' ? data.email : undefined,
    message: typeof data.error === 'string' ? data.error : 'Someone with this email already exists.',
  };
}

/** Formats a "HH:MM" 24-hour time string as a 12-hour label, e.g. "14:30" -> "2:30 PM". Returns "—" for anything unparseable. */
export function formatTimeLabel(time?: string): string {
  if (!time) return '—';
  const match = /^(\d{1,2}):(\d{2})/.exec(time);
  if (!match) return time;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (Number.isNaN(h) || Number.isNaN(m)) return time;
  const ampm = h < 12 ? 'AM' : 'PM';
  const displayHour = h % 12 === 0 ? 12 : h % 12;
  return `${displayHour}:${String(m).padStart(2, '0')} ${ampm}`;
}

/** Adds `minutes` to a "HH:MM" time string, wrapping within a 24-hour day. */
export function addMinutesToTime(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return time;
  const total = (h * 60 + m + minutes + 1440) % 1440;
  const nh = Math.floor(total / 60);
  const nm = total % 60;
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
}

/** Formats a check-in/registration timestamp as "Today, 2:30 PM" for today, else a plain date+time. Returns "—" if absent/unparseable. */
export function formatCheckInTimestamp(date: string | Date | undefined | null): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—';
  const now = new Date();
  const isToday = d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return isToday ? `Today, ${time}` : `${formatDate(d)}, ${time}`;
}

export function getAvatarUrl(name: string, email?: string): string {
  if (email) {
    // Gravatar fallback
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2563EB&color=fff&size=200`;
  }
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2563EB&color=fff&size=200`;
}
