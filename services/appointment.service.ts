import api from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import type { Appointment, CursorPaginatedResponse, TableFilters } from '@/types';

export const appointmentService = {
  async getAppointments(filters: TableFilters = {}): Promise<CursorPaginatedResponse<Appointment>> {
    const p = new URLSearchParams();
    p.set('limit', String(filters.limit ?? 50));
    if (filters.cursor) p.set('cursor', filters.cursor);
    if (filters.search) p.set('search', filters.search);
    if (filters.status) p.set('status', filters.status);
    const { data } = await api.get<CursorPaginatedResponse<Appointment>>(
      `${API_ENDPOINTS.APPOINTMENTS}?${p}`
    );
    return data;
  },

  async createAppointment(input: Partial<Appointment>): Promise<Appointment> {
    const { data } = await api.post<Appointment>(API_ENDPOINTS.APPOINTMENTS, input);
    return data;
  },

  async updateAppointmentStatus(id: string, status: Appointment['status']): Promise<Appointment> {
    const { data } = await api.put<Appointment>(`${API_ENDPOINTS.APPOINTMENTS}/${id}/status`, { status });
    return data;
  },
};
