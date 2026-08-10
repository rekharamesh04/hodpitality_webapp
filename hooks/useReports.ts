import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { reportService } from "@/services/report.service";

export const reportKeys = {
  dashboard: ["reports", "dashboard"] as const,
  daily: (days: number) => ["reports", "daily", days] as const,
  guestArrivals: ["reports", "guest-arrivals"] as const,
  monthlyEvents: ["reports", "monthly-events"] as const,
  revenue: ["reports", "revenue"] as const,
  nationality: ["reports", "nationality"] as const,
  checkInHour: ["reports", "checkin-hour"] as const,
};

export function useDashboardStats() {
  return useQuery({
    queryKey: reportKeys.dashboard,
    queryFn: reportService.getDashboardStats,
    refetchInterval: 30000,
  });
}

export function useDailyReports(days = 7) {
  return useQuery({
    queryKey: reportKeys.daily(days),
    queryFn: () => reportService.getDailyReports(days),
  });
}

export function useGuestArrivalsChart() {
  return useQuery({
    queryKey: reportKeys.guestArrivals,
    queryFn: reportService.getGuestArrivalsChart,
  });
}

export function useMonthlyEventsChart() {
  return useQuery({
    queryKey: reportKeys.monthlyEvents,
    queryFn: reportService.getMonthlyEventsChart,
  });
}

export function useRevenueTrendChart() {
  return useQuery({
    queryKey: reportKeys.revenue,
    queryFn: reportService.getRevenueTrendChart,
  });
}

export function useNationalityChart() {
  return useQuery({
    queryKey: reportKeys.nationality,
    queryFn: reportService.getNationalityChart,
  });
}

export function useCheckInByHour() {
  return useQuery({
    queryKey: reportKeys.checkInHour,
    queryFn: reportService.getCheckInByHour,
  });
}

export function useExportReport() {
  return async (type: string) => {
    try {
      const blob = await reportService.exportReport(type);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${type}-report-${Date.now()}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Report exported!");
    } catch {
      toast.error("Export failed");
    }
  };
}
