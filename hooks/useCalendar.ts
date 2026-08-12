import { useQuery } from "@tanstack/react-query";
import { calendarService } from "@/services/calendar.service";
import { QUERY_KEYS } from "@/constants";
import type { CalendarEventsResponse, CalendarDayView } from "@/types";

export function useCalendar() {
  return useQuery<CalendarDayView>({
    queryKey: QUERY_KEYS.CALENDAR,
    queryFn:  calendarService.getCalendar,
  });
}

export function useCalendarEvents() {
  return useQuery<CalendarEventsResponse>({
    queryKey: [...QUERY_KEYS.CALENDAR, "events"],
    queryFn:  calendarService.getCalendarEvents,
  });
}
