import { useQuery } from "@tanstack/react-query";
import { calendarService } from "@/services/calendar.service";
import { QUERY_KEYS } from "@/constants";

export function useCalendar() {
  return useQuery({
    queryKey: QUERY_KEYS.CALENDAR,
    queryFn:  calendarService.getCalendar,
  });
}

export function useCalendarEvents() {
  return useQuery({
    queryKey: [...QUERY_KEYS.CALENDAR, "events"],
    queryFn:  calendarService.getCalendarEvents,
  });
}
