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

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
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

export function getStatusColor(status: string): string {
  const statusMap: Record<string, string> = {
    active: 'text-green-600 bg-green-50 border-green-200',
    inactive: 'text-gray-600 bg-gray-50 border-gray-200',
    pending: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    completed: 'text-blue-600 bg-blue-50 border-blue-200',
    cancelled: 'text-red-600 bg-red-50 border-red-200',
    confirmed: 'text-green-600 bg-green-50 border-green-200',
    checked_in: 'text-blue-600 bg-blue-50 border-blue-200',
    checked_out: 'text-gray-600 bg-gray-50 border-gray-200',
    arrived: 'text-teal-600 bg-teal-50 border-teal-200',
    on_site: 'text-green-600 bg-green-50 border-green-200',
    // Payment statuses reuse the same semantic buckets above — no new colors.
    paid: 'text-green-600 bg-green-50 border-green-200',
    processing: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    failed: 'text-red-600 bg-red-50 border-red-200',
    refunded: 'text-blue-600 bg-blue-50 border-blue-200',
    partially_refunded: 'text-teal-600 bg-teal-50 border-teal-200',
  };
  return statusMap[(status ?? '').toLowerCase()] || statusMap.inactive;
}

export function getStatusColorDark(status: string): string {
  const statusMap: Record<string, string> = {
    active: 'text-green-400 bg-green-950/30 border-green-800',
    inactive: 'text-gray-400 bg-gray-900/30 border-gray-700',
    pending: 'text-yellow-400 bg-yellow-950/30 border-yellow-800',
    completed: 'text-blue-400 bg-blue-950/30 border-blue-800',
    cancelled: 'text-red-400 bg-red-950/30 border-red-800',
    confirmed: 'text-green-400 bg-green-950/30 border-green-800',
    checked_in: 'text-blue-400 bg-blue-950/30 border-blue-800',
    checked_out: 'text-gray-400 bg-gray-900/30 border-gray-700',
    arrived: 'text-teal-400 bg-teal-950/30 border-teal-800',
    on_site: 'text-green-400 bg-green-950/30 border-green-800',
    // Payment statuses reuse the same semantic buckets above — no new colors.
    paid: 'text-green-400 bg-green-950/30 border-green-800',
    processing: 'text-yellow-400 bg-yellow-950/30 border-yellow-800',
    failed: 'text-red-400 bg-red-950/30 border-red-800',
    refunded: 'text-blue-400 bg-blue-950/30 border-blue-800',
    partially_refunded: 'text-teal-400 bg-teal-950/30 border-teal-800',
  };
  return statusMap[(status ?? '').toLowerCase()] || statusMap.inactive;
}

export function generateQRCode(data: string): string {
  // In production, use a proper QR code library
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}`;
}

export function exportToCSV(data: any[], filename: string): void {
  if (!data.length) return;
  
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value;
      }).join(',')
    ),
  ].join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv' });
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
  const candidate = r.invitationError ?? r.invitation_error ?? r.inviteError ?? r.cognitoError ?? r.cognito_error ?? r.warning;
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
