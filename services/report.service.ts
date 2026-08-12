import api from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import type { DashboardStats, DailyReport, ChartDataPoint, DashboardActivityItem } from '@/types';

export const reportService = {
  async getDashboardStats(): Promise<DashboardStats> {
    const { data } = await api.get<DashboardStats>(API_ENDPOINTS.REPORTS.DASHBOARD_STATS);
    return data;
  },

  async getDailyReports(days = 7): Promise<DailyReport[]> {
    const { data } = await api.get<DailyReport[]>(`${API_ENDPOINTS.REPORTS.DAILY}?days=${days}`);
    return data;
  },

  async getActivityFeed(): Promise<DashboardActivityItem[]> {
    const { data } = await api.get<DashboardActivityItem[]>(API_ENDPOINTS.DASHBOARD.ACTIVITY);
    return data;
  },

  async getChartData(type: string): Promise<ChartDataPoint[]> {
    const { data } = await api.get<ChartDataPoint[]>(API_ENDPOINTS.DASHBOARD.CHARTS(type));
    return data;
  },

  async getGuestArrivalsChart(): Promise<ChartDataPoint[]> {
    const { data } = await api.get<ChartDataPoint[]>(API_ENDPOINTS.REPORTS.GUEST_ARRIVALS);
    return data;
  },

  async getMonthlyEventsChart(): Promise<ChartDataPoint[]> {
    const { data } = await api.get<ChartDataPoint[]>(API_ENDPOINTS.REPORTS.MONTHLY_EVENTS);
    return data;
  },

  async getRevenueTrendChart(): Promise<ChartDataPoint[]> {
    const { data } = await api.get<ChartDataPoint[]>(API_ENDPOINTS.REPORTS.REVENUE_TREND);
    return data;
  },

  async exportReport(payload: { type: string; format: 'pdf' | 'excel'; dateFrom?: string; dateTo?: string }): Promise<{ downloadUrl: string }> {
    const { data } = await api.post<{ downloadUrl: string }>(API_ENDPOINTS.REPORTS.EXPORT, payload);
    return data;
  },
};
