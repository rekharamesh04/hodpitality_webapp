import api from '@/lib/axios';
import { unwrapList } from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import type { Event, CheckIn, TableFilters } from '@/types';

export const eventService = {
  async getEvents(filters: TableFilters = {}): Promise<Event[]> {
    const p = new URLSearchParams();
    if (filters.status) p.set('status', filters.status);
    if (filters.category) p.set('category', filters.category);
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

  async getEventAttendees(id: string): Promise<CheckIn[]> {
    const { data } = await api.get(`${API_ENDPOINTS.EVENTS}/${id}/attendees`);
    return unwrapList<CheckIn>(data);
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
