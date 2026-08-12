import api from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import type { CalendarEvent } from '@/types';

export const calendarService = {
  /** Raw event list for FullCalendar or similar renderers */
  async getCalendarEvents(): Promise<CalendarEvent[]> {
    const { data } = await api.get<CalendarEvent[]>(`${API_ENDPOINTS.CALENDAR}/events`);
    return data;
  },

  /** Full day-view grid data for the calendar UI page */
  async getCalendar(): Promise<CalendarEvent[]> {
    const { data } = await api.get<CalendarEvent[]>(API_ENDPOINTS.CALENDAR);
    return data;
  },
};
