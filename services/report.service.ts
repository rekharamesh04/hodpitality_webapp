import { sleep } from "@/utils/helpers";
import { mockDashboardStats as MOCK_DASHBOARD_STATS } from "@/constants/mock-data";
import type { DashboardStats } from "@/types";

type DailyReport = any;

// Stub chart data for local use
const MOCK_DAILY_REPORTS: any[] = [];
const GUEST_ARRIVALS_CHART: any[] = [];
const MONTHLY_EVENTS_CHART: any[] = [];
const REVENUE_TREND_CHART: any[] = [];
const NATIONALITY_CHART: any[] = [];
const CHECK_IN_BY_HOUR: any[] = [];

export const reportService = {
  async getDashboardStats(): Promise<DashboardStats> {
    await sleep(350);
    return MOCK_DASHBOARD_STATS;
  },

  async getDailyReports(days = 7): Promise<DailyReport[]> {
    await sleep(400);
    return MOCK_DAILY_REPORTS.slice(0, days);
  },

  async getGuestArrivalsChart() {
    await sleep(300);
    return GUEST_ARRIVALS_CHART;
  },

  async getMonthlyEventsChart() {
    await sleep(300);
    return MONTHLY_EVENTS_CHART;
  },

  async getRevenueTrendChart() {
    await sleep(300);
    return REVENUE_TREND_CHART;
  },

  async getNationalityChart() {
    await sleep(300);
    return NATIONALITY_CHART;
  },

  async getCheckInByHour() {
    await sleep(300);
    return CHECK_IN_BY_HOUR;
  },

  async exportReport(type: string, format: "csv" | "pdf" = "csv"): Promise<Blob> {
    await sleep(1200);
    void format;
    const content = `Report: ${type}\nGenerated: ${new Date().toISOString()}\nData: Sample export data`;
    return new Blob([content], { type: "text/plain" });
  },
};
