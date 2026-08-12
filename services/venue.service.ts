import api from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import type { Venue, CursorPaginatedResponse, TableFilters } from '@/types';

export const venueService = {
  async getVenues(filters: TableFilters = {}): Promise<CursorPaginatedResponse<Venue>> {
    const p = new URLSearchParams();
    p.set('limit', String(filters.limit ?? 50));
    if (filters.cursor) p.set('cursor', filters.cursor);
    if (filters.search) p.set('search', filters.search);
    const { data } = await api.get<CursorPaginatedResponse<Venue>>(
      `${API_ENDPOINTS.VENUES}?${p}`
    );
    return data;
  },

  async getVenue(id: string): Promise<Venue> {
    const { data } = await api.get<Venue>(`${API_ENDPOINTS.VENUES}/${id}`);
    return data;
  },

  async createVenue(input: Partial<Venue>): Promise<Venue> {
    const { data } = await api.post<Venue>(API_ENDPOINTS.VENUES, input);
    return data;
  },

  async updateVenue(id: string, input: Partial<Venue>): Promise<Venue> {
    const { data } = await api.put<Venue>(`${API_ENDPOINTS.VENUES}/${id}`, input);
    return data;
  },

  async deleteVenue(id: string): Promise<void> {
    await api.delete(`${API_ENDPOINTS.VENUES}/${id}`);
  },

  async updateOccupancy(id: string, currentOccupancy: number): Promise<Venue> {
    const { data } = await api.put<Venue>(`${API_ENDPOINTS.VENUES}/${id}/occupancy`, { currentOccupancy });
    return data;
  },
};
