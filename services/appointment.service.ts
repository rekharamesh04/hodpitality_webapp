import api from '@/lib/axios';
import { unwrapList } from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import type { Appointment } from '@/types';
import { debugLog } from '@/utils/debugLog';

/** Reasonable page-size ceiling for itemized [LIST][ITEM] logging — above this we log a small sample + count only, to avoid spamming the console for large result sets. */
const LIST_ITEM_LOG_CAP = 100;

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
    debugLog('[ADMIN][APPOINTMENTS][LIST][REQUEST]', { endpoint: API_ENDPOINTS.APPOINTMENTS });
    const response = await api.get(`${API_ENDPOINTS.APPOINTMENTS}?${p}`);
    const appointments = unwrapList<Appointment>(response.data);
    debugLog('[ADMIN][APPOINTMENTS][LIST][RESPONSE]', { status: response.status, count: appointments.length });
    // Itemized per-appointment logging is capped (LIST_ITEM_LOG_CAP) so an unusually large
    // result set doesn't spam the console — beyond the cap we only log a small sample.
    const itemsToLog = appointments.length > LIST_ITEM_LOG_CAP ? appointments.slice(0, 10) : appointments;
    itemsToLog.forEach((a) => {
      debugLog('[ADMIN][APPOINTMENTS][LIST][ITEM]', {
        id: a.id ?? null,
        customerId: a.customerId ?? null,
        tenantId: (a as unknown as Record<string, unknown>).tenantId ?? null,
        service: a.service ?? a.serviceName ?? null,
        date: a.date ?? null,
        status: a.status ?? null,
      });
    });
    if (appointments.length > LIST_ITEM_LOG_CAP) {
      debugLog('[ADMIN][APPOINTMENTS][LIST][ITEM]', {
        note: `sample of first 10 of ${appointments.length} items logged (cap ${LIST_ITEM_LOG_CAP})`,
      });
    }
    return appointments;
  },

  async createAppointment(input: CreateAppointmentPayload): Promise<Appointment> {
    debugLog('[ADMIN][APPOINTMENT][CREATE][REQUEST]', {
      endpoint: API_ENDPOINTS.APPOINTMENTS,
      customerId: input.customerId ?? null,
      serviceId: input.serviceId ?? null,
      staffId: input.staffId ?? null,
      date: input.date ?? null,
      time: input.startTime ?? null,
      tenantId: (input as unknown as Record<string, unknown>).tenantId ?? null,
    });
    try {
      const response = await api.post<Appointment>(API_ENDPOINTS.APPOINTMENTS, input);
      const data = response.data;
      debugLog('[ADMIN][APPOINTMENT][CREATE][SUCCESS]', {
        httpStatus: response.status,
        appointmentId: data?.id ?? null,
        customerId: data?.customerId ?? null,
        tenantId: (data as unknown as Record<string, unknown>)?.tenantId ?? null,
        appointmentStatus: data?.status ?? null,
      });
      return data;
    } catch (err: any) {
      debugLog('[ADMIN][APPOINTMENT][CREATE][ERROR]', {
        httpStatus: err?.response?.status ?? null,
        customerId: input.customerId ?? null,
        tenantId: (input as unknown as Record<string, unknown>).tenantId ?? null,
        message: err?.backendMessage ?? err?.message ?? null,
      });
      throw err;
    }
  },

  /** The backend owns every status side-effect (arrivedAt/checkinId on arrival, checkoutAt on completion, schedule-lock release on cancel/no-show) — this only ever sends the target status. */
  async updateAppointmentStatus(id: string, status: AppointmentStatusValue): Promise<Appointment> {
    const { data } = await api.put<Appointment>(`${API_ENDPOINTS.APPOINTMENTS}/${id}/status`, { status });
    return data;
  },
};
