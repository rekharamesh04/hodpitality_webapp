import api from '@/lib/axios';
import { unwrapList } from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import type { Appointment } from '@/types';

export type AppointmentStatusValue = NonNullable<Appointment['status']>;

export interface AppointmentFilters {
  date?: string;
}

export interface CreateAppointmentPayload {
  customerId: string;
  staffId: string;
  /** ISO date string, YYYY-MM-DD */
  date: string;
  /** HH:MM */
  startTime: string;
  service?: string;
  serviceId?: string;
  serviceName?: string;
  duration?: number;
  room?: string;
  status?: AppointmentStatusValue;
  notes?: string;
}

export const appointmentService = {
  async getAppointments(filters: AppointmentFilters = {}): Promise<Appointment[]> {
    const p = new URLSearchParams();
    if (filters.date) p.set('date', filters.date);
    const { data } = await api.get(`${API_ENDPOINTS.APPOINTMENTS}?${p}`);
    return unwrapList<Appointment>(data);
  },

  async createAppointment(input: CreateAppointmentPayload): Promise<Appointment> {
    const { data } = await api.post<Appointment>(API_ENDPOINTS.APPOINTMENTS, input);
    return data;
  },

  /** The backend owns every status side-effect (arrivedAt/checkinId on arrival, checkoutAt on completion, schedule-lock release on cancel/no-show) — this only ever sends the target status. */
  async updateAppointmentStatus(id: string, status: AppointmentStatusValue): Promise<Appointment> {
    const { data } = await api.put<Appointment>(`${API_ENDPOINTS.APPOINTMENTS}/${id}/status`, { status });
    return data;
  },
};
