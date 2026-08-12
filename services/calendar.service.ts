import api from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import type { CalendarEventsResponse, CalendarDayView } from '@/types';

export const calendarService = {
  async getCalendarEvents(): Promise<CalendarEventsResponse> {
    const { data } = await api.get<CalendarEventsResponse>(`${API_ENDPOINTS.CALENDAR}/events`);
    return data;
  },

  async getCalendar(): Promise<CalendarDayView> {
    const { data } = await api.get<CalendarDayView>(API_ENDPOINTS.CALENDAR);
    return data;
  },
};
