import api from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import type { Guest, CursorPaginatedResponse, TableFilters } from '@/types';

function buildParams(filters: TableFilters): URLSearchParams {
  const p = new URLSearchParams();
  if (filters.limit)   p.set('limit',  String(filters.limit));
  if (filters.cursor)  p.set('cursor', filters.cursor);
  if (filters.search)  p.set('search', filters.search);
  if (filters.status)  p.set('status', filters.status);
  return p;
}

export const guestService = {
  async getGuests(filters: TableFilters = {}): Promise<CursorPaginatedResponse<Guest>> {
    const params = buildParams({ limit: 50, ...filters });
    const { data } = await api.get<CursorPaginatedResponse<Guest>>(
      `${API_ENDPOINTS.GUESTS}?${params}`
    );
    return data;
  },

  async getGuest(id: string): Promise<Guest> {
    const { data } = await api.get<Guest>(`${API_ENDPOINTS.GUESTS}/${id}`);
    return data;
  },

  async createGuest(input: Partial<Guest>): Promise<Guest> {
    const { data } = await api.post<Guest>(API_ENDPOINTS.GUESTS, input);
    return data;
  },

  async updateGuest(id: string, input: Partial<Guest>): Promise<Guest> {
    const { data } = await api.put<Guest>(`${API_ENDPOINTS.GUESTS}/${id}`, input);
    return data;
  },

  async deleteGuest(id: string): Promise<void> {
    await api.delete(`${API_ENDPOINTS.GUESTS}/${id}`);
  },

  async bulkDeleteGuests(ids: string[]): Promise<void> {
    await api.delete(`${API_ENDPOINTS.GUESTS}/bulk`, { data: { ids } });
  },

  async bulkImportGuests(file: File): Promise<{ imported: number; errors: string[] }> {
    const form = new FormData();
    form.append('file', file);
    const { data } = await api.post<{ imported: number; errors: string[] }>(
      `${API_ENDPOINTS.GUESTS}/bulk-import`,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return data;
  },

  async exportGuests(): Promise<{ downloadUrl: string }> {
    const { data } = await api.get<{ downloadUrl: string }>(`${API_ENDPOINTS.GUESTS}/export`);
    return data;
  },
};
