import api from '@/lib/axios';
import { unwrapList } from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import type { Venue, TableFilters } from '@/types';

export const venueService = {
  async getVenues(filters: TableFilters = {}): Promise<Venue[]> {
    const p = new URLSearchParams();
    if (filters.search) p.set('search', filters.search);
    const { data } = await api.get(`${API_ENDPOINTS.VENUES}?${p}`);
    return unwrapList<Venue>(data);
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

  async updateOccupancy(id: string, occupancy: number): Promise<Venue> {
    const { data } = await api.put<Venue>(`${API_ENDPOINTS.VENUES}/${id}/occupancy`, { occupancy });
    return data;
  },
};
