import { useQuery } from "@tanstack/react-query";
import { reportService } from "@/services/report.service";
import { eventService } from "@/services/event.service";
import { QUERY_KEYS } from "@/constants";

export function useDashboardStats() {
  return useQuery({
    queryKey: QUERY_KEYS.REPORTS,
    queryFn:  reportService.getDashboardStats,
    refetchInterval: 30000,
  });
}

export function useActivityFeed() {
  return useQuery({
    queryKey: [...QUERY_KEYS.REPORTS, "activity"],
    queryFn:  reportService.getActivityFeed,
    refetchInterval: 20000,
  });
}

export function useUpcomingEvents() {
  return useQuery({
    queryKey: QUERY_KEYS.UPCOMING_EVENTS,
    queryFn:  () => eventService.getUpcomingEvents(),
  });
}
