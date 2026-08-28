import api from '@/lib/axios';
import { unwrapList } from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import type { Venue, TableFilters } from '@/types';

export interface VenueFilters extends Omit<TableFilters, 'status'> {
  status?: string;
}

export interface CreateVenuePayload {
  name: string;
  capacity: number;
  type?: string;
  location?: string;
  status?: Venue['status'];
  amenities?: string[];
  image?: string;
  /** Rarely set directly by the Venue form (occupancy has its own dedicated PUT .../occupancy endpoint) — accepted here too since other call sites in this codebase seed it at creation time. */
  occupancy?: number;
  currentOccupancy?: number;
}

export type UpdateVenuePayload = Partial<CreateVenuePayload>;

function buildParams(filters: VenueFilters): URLSearchParams {
  const p = new URLSearchParams();
  if (filters.search) p.set('search', filters.search);
  if (filters.status) p.set('status', filters.status);
  return p;
}

export const venueService = {
  /** GET /venues returns a flat, unpaginated list (no page/limit/total) — the page windows it client-side. */
  async getVenues(filters: VenueFilters = {}): Promise<Venue[]> {
    const p = buildParams(filters);
    const { data } = await api.get(`${API_ENDPOINTS.VENUES}?${p}`);
    return unwrapList<Venue>(data);
  },

  async getVenue(id: string): Promise<Venue> {
    const { data } = await api.get<Venue>(`${API_ENDPOINTS.VENUES}/${id}`);
    return data;
  },

  async createVenue(input: CreateVenuePayload): Promise<Venue> {
    const { data } = await api.post<Venue>(API_ENDPOINTS.VENUES, input);
    return data;
  },

  async updateVenue(id: string, input: UpdateVenuePayload): Promise<Venue> {
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
