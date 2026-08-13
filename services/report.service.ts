import api from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import type { DashboardStats, DailyReport, ChartDataPoint, DashboardActivityItem } from '@/types';

/** Normalise any API response into a plain array regardless of wrapping shape. */
function toArray<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (raw && typeof raw === 'object') {
    const r = raw as Record<string, unknown>;
    if (Array.isArray(r.data))    return r.data as T[];
    if (Array.isArray(r.entries)) return r.entries as T[];
    if (Array.isArray(r.items))   return r.items as T[];
  }
  return [];
}

export const reportService = {
  async getDashboardStats(): Promise<DashboardStats> {
    const { data } = await api.get<DashboardStats>(API_ENDPOINTS.REPORTS.DASHBOARD_STATS);
    return data;
  },

  async getDailyReports(days = 7): Promise<DailyReport[]> {
    const { data } = await api.get(`${API_ENDPOINTS.REPORTS.DAILY}?days=${days}`);
    return toArray<DailyReport>(data);
  },

  async getActivityFeed(): Promise<DashboardActivityItem[]> {
    const { data } = await api.get(API_ENDPOINTS.DASHBOARD.ACTIVITY);
    return toArray<DashboardActivityItem>(data);
  },

  async getChartData(type: string): Promise<ChartDataPoint[]> {
    const { data } = await api.get(API_ENDPOINTS.DASHBOARD.CHARTS(type));
    return toArray<ChartDataPoint>(data);
  },

  async getGuestArrivalsChart(): Promise<ChartDataPoint[]> {
    const { data } = await api.get(API_ENDPOINTS.REPORTS.GUEST_ARRIVALS);
    return toArray<ChartDataPoint>(data);
  },

  async getMonthlyEventsChart(): Promise<ChartDataPoint[]> {
    const { data } = await api.get(API_ENDPOINTS.REPORTS.MONTHLY_EVENTS);
    return toArray<ChartDataPoint>(data);
  },

  async getRevenueTrendChart(): Promise<ChartDataPoint[]> {
    const { data } = await api.get(API_ENDPOINTS.REPORTS.REVENUE_TREND);
    return toArray<ChartDataPoint>(data);
  },

  async exportReport(payload: { type: string; format: 'pdf' | 'excel'; dateFrom?: string; dateTo?: string }): Promise<{ downloadUrl: string }> {
    const { data } = await api.post<{ downloadUrl: string }>(API_ENDPOINTS.REPORTS.EXPORT, payload);
    return data;
  },
};
