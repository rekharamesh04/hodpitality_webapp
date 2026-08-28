import { useQuery } from "@tanstack/react-query";
import { calendarService } from "@/services/calendar.service";
import { QUERY_KEYS } from "@/constants";
import type { CalendarEventsResponse, CalendarDayView } from "@/types";

export function useCalendar(date?: string, options?: { enabled?: boolean }) {
  return useQuery<CalendarDayView>({
    queryKey: [...QUERY_KEYS.CALENDAR, date],
    queryFn:  () => calendarService.getCalendar(date),
    enabled:  options?.enabled ?? true,
  });
}

export function useCalendarEvents(month?: string, options?: { enabled?: boolean }) {
  return useQuery<CalendarEventsResponse>({
    queryKey: [...QUERY_KEYS.CALENDAR, "events", month],
    queryFn:  () => calendarService.getCalendarEvents(month),
    staleTime: 60_000,
    enabled:  options?.enabled ?? true,
  });
}

/** Services rarely change — cache them so switching dates/months or reopening the create dialog doesn't re-fetch. */
export function useServices() {
  return useQuery({
    queryKey: ["services"],
    queryFn:  () => calendarService.getServices(),
    staleTime: 5 * 60_000,
  });
}
