import api from '@/lib/axios';
import { unwrapList } from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import type { CalendarEventsResponse, CalendarDayView } from '@/types';

export interface SpaService {
  id: string;
  name: string;
  duration: number;
  room?: string;
}

/** Owns GET /calendar, GET /calendar/events and GET /services. Appointment CRUD lives in appointment.service.ts — see hooks/useAppointments.ts. */
export const calendarService = {
  async getCalendarEvents(month?: string): Promise<CalendarEventsResponse> {
    const p = month ? `?month=${month}` : '';
    const { data } = await api.get<CalendarEventsResponse>(`${API_ENDPOINTS.CALENDAR}/events${p}`);
    return data;
  },

  async getCalendar(date?: string): Promise<CalendarDayView> {
    const p = date ? `?date=${date}` : '';
    const { data } = await api.get<CalendarDayView>(`${API_ENDPOINTS.CALENDAR}${p}`);
    return data;
  },

  async getServices(): Promise<SpaService[]> {
    const { data } = await api.get(API_ENDPOINTS.SERVICES);
    return unwrapList<SpaService>(data);
  },
};
