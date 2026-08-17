import api from '@/lib/axios';
import { unwrapList } from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import type { CalendarEventsResponse, CalendarDayView, Appointment } from '@/types';

export interface SpaService {
  id: string;
  name: string;
  duration: number;
  room?: string;
}

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
    const { data } = await api.get('/services');
    return unwrapList<SpaService>(data);
  },

  async getAppointments(date?: string): Promise<Appointment[]> {
    const p = date ? `?date=${date}` : '';
    const { data } = await api.get(`${API_ENDPOINTS.APPOINTMENTS}${p}`);
    return unwrapList<Appointment>(data);
  },

  async createAppointment(input: Partial<Appointment>): Promise<Appointment> {
    const { data } = await api.post<Appointment>(API_ENDPOINTS.APPOINTMENTS, input);
    return data;
  },

  async updateAppointmentStatus(id: string, status: string): Promise<Appointment> {
    const { data } = await api.put<Appointment>(`${API_ENDPOINTS.APPOINTMENTS}/${id}/status`, { status });
    return data;
  },
};
