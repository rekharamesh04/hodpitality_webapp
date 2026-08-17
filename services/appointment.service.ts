import api from '@/lib/axios';
import { unwrapList } from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import type { Appointment, TableFilters } from '@/types';

export const appointmentService = {
  async getAppointments(filters: TableFilters = {}): Promise<Appointment[]> {
    const p = new URLSearchParams();
    if (filters.dateFrom) p.set('date', filters.dateFrom);
    const { data } = await api.get(`${API_ENDPOINTS.APPOINTMENTS}?${p}`);
    return unwrapList<Appointment>(data);
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
