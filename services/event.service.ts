import api from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import type { Event, CheckIn, CursorPaginatedResponse, TableFilters } from '@/types';

export const eventService = {
  async getEvents(filters: TableFilters = {}): Promise<CursorPaginatedResponse<Event>> {
    const p = new URLSearchParams();
    p.set('limit', String(filters.limit ?? 50));
    if (filters.cursor) p.set('cursor', filters.cursor);
    if (filters.search) p.set('search', filters.search);
    if (filters.status) p.set('status', filters.status);
    const { data } = await api.get<CursorPaginatedResponse<Event>>(
      `${API_ENDPOINTS.EVENTS}?${p}`
    );
    return data;
  },

  async getEvent(id: string): Promise<Event> {
    const { data } = await api.get<Event>(`${API_ENDPOINTS.EVENTS}/${id}`);
    return data;
  },

  async getUpcomingEvents(): Promise<Event[]> {
    const { data } = await api.get<Event[]>(`${API_ENDPOINTS.EVENTS}/upcoming`);
    return data;
  },

  async getEventAttendees(id: string): Promise<CheckIn[]> {
    const { data } = await api.get<CheckIn[]>(`${API_ENDPOINTS.EVENTS}/${id}/attendees`);
    return data;
  },

  async createEvent(input: Partial<Event>): Promise<Event> {
    const { data } = await api.post<Event>(API_ENDPOINTS.EVENTS, input);
    return data;
  },

  async updateEvent(id: string, input: Partial<Event>): Promise<Event> {
    const { data } = await api.put<Event>(`${API_ENDPOINTS.EVENTS}/${id}`, input);
    return data;
  },

  async deleteEvent(id: string): Promise<void> {
    await api.delete(`${API_ENDPOINTS.EVENTS}/${id}`);
  },
};
