import { useQuery } from "@tanstack/react-query";
import { calendarService } from "@/services/calendar.service";
import { QUERY_KEYS } from "@/constants";
import type { CalendarEventsResponse, CalendarDayView } from "@/types";

export function useCalendar(date?: string) {
  return useQuery<CalendarDayView>({
    queryKey: [...QUERY_KEYS.CALENDAR, date],
    queryFn:  () => calendarService.getCalendar(date),
  });
}

export function useCalendarEvents(month?: string) {
  return useQuery<CalendarEventsResponse>({
    queryKey: [...QUERY_KEYS.CALENDAR, "events", month],
    queryFn:  () => calendarService.getCalendarEvents(month),
  });
}
