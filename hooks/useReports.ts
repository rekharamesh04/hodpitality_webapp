import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { reportService } from "@/services/report.service";
import { QUERY_KEYS } from "@/constants";

export const reportKeys = {
  dashboard:     QUERY_KEYS.REPORTS,
  activity:      [...QUERY_KEYS.REPORTS, "activity"] as const,
  daily:         (days: number) => [...QUERY_KEYS.REPORTS, "daily", days] as const,
  guestArrivals: [...QUERY_KEYS.REPORTS, "guest-arrivals"] as const,
  monthlyEvents: [...QUERY_KEYS.REPORTS, "monthly-events"] as const,
  revenue:       [...QUERY_KEYS.REPORTS, "revenue"] as const,
  chart:         (type: string) => [...QUERY_KEYS.REPORTS, "chart", type] as const,
};

export function useDashboardStats() {
  return useQuery({
    queryKey: reportKeys.dashboard,
    queryFn:  reportService.getDashboardStats,
    refetchInterval: 30000,
  });
}

export function useDashboardActivity() {
  return useQuery({
    queryKey: reportKeys.activity,
    queryFn:  reportService.getActivityFeed,
    refetchInterval: 20000,
  });
}

export function useChartData(type: string) {
  return useQuery({
    queryKey: reportKeys.chart(type),
    queryFn:  () => reportService.getChartData(type),
    enabled:  !!type,
  });
}

export function useDailyReports(days = 7) {
  return useQuery({
    queryKey: reportKeys.daily(days),
    queryFn:  () => reportService.getDailyReports(days),
  });
}

export function useGuestArrivalsChart() {
  return useQuery({
    queryKey: reportKeys.guestArrivals,
    queryFn:  reportService.getGuestArrivalsChart,
  });
}

export function useMonthlyEventsChart() {
  return useQuery({
    queryKey: reportKeys.monthlyEvents,
    queryFn:  reportService.getMonthlyEventsChart,
  });
}

export function useRevenueTrendChart() {
  return useQuery({
    queryKey: reportKeys.revenue,
    queryFn:  reportService.getRevenueTrendChart,
  });
}

export function useExportReport() {
  return useMutation({
    mutationFn: (payload: { type: string; format: 'pdf' | 'excel'; dateFrom?: string; dateTo?: string }) =>
      reportService.exportReport(payload),
    onSuccess: (data) => {
      toast.success("Report generated!");
      if (data.downloadUrl) window.open(data.downloadUrl, '_blank');
    },
    onError: () => toast.error("Failed to generate report"),
  });
}
