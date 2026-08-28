import api from '@/lib/axios';
import { unwrapList } from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import type { Event, CheckIn, TableFilters } from '@/types';

export interface EventFilters extends Omit<TableFilters, 'status'> {
  status?: string;
}

export interface CreateEventPayload {
  title: string;
  /** ISO date/datetime string */
  startDate: string;
  endDate?: string;
  venue?: string;
  venueId?: string;
  category?: string;
  status?: Event['status'];
  capacity?: number;
  description?: string;
  organizer?: string;
  /** Rarely set directly by the Create Event form (the backend defaults this to 0) — seeded explicitly by the venue-booking workflow in services/workflowService.ts. */
  attendees?: number;
}

export type UpdateEventPayload = Partial<CreateEventPayload>;

function buildParams(filters: EventFilters): URLSearchParams {
  const p = new URLSearchParams();
  if (filters.search)   p.set('search', filters.search);
  if (filters.status)   p.set('status', filters.status);
  if (filters.category) p.set('category', filters.category);
  return p;
}

export const eventService = {
  /** GET /events returns a flat, unpaginated list (no page/limit/total) — the page windows it client-side. */
  async getEvents(filters: EventFilters = {}): Promise<Event[]> {
    const p = buildParams(filters);
    const { data } = await api.get(`${API_ENDPOINTS.EVENTS}?${p}`);
    return unwrapList<Event>(data);
  },

  async getEvent(id: string): Promise<Event> {
    const { data } = await api.get<Event>(`${API_ENDPOINTS.EVENTS}/${id}`);
    return data;
  },

  async getUpcomingEvents(limit = 5): Promise<Event[]> {
    const { data } = await api.get(`${API_ENDPOINTS.EVENTS}/upcoming?limit=${limit}`);
    return unwrapList<Event>(data);
  },

  /** Real, existing endpoint — the actual data source for the Guest/Check-in relationship on an event. Returns check-in records, not raw guest records. */
  async getEventAttendees(id: string): Promise<CheckIn[]> {
    const { data } = await api.get(`${API_ENDPOINTS.EVENTS}/${id}/attendees`);
    return unwrapList<CheckIn>(data);
  },

  async createEvent(input: CreateEventPayload): Promise<Event> {
    const { data } = await api.post<Event>(API_ENDPOINTS.EVENTS, input);
    return data;
  },

  async updateEvent(id: string, input: UpdateEventPayload): Promise<Event> {
    const { data } = await api.put<Event>(`${API_ENDPOINTS.EVENTS}/${id}`, input);
    return data;
  },

  async deleteEvent(id: string): Promise<void> {
    await api.delete(`${API_ENDPOINTS.EVENTS}/${id}`);
  },
};
