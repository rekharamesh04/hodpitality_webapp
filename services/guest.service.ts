import api from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import type { Guest, PaginatedResponse, TableFilters } from '@/types';

function buildParams(filters: TableFilters): URLSearchParams {
  const p = new URLSearchParams();
  if (filters.page)     p.set('page',   String(filters.page));
  if (filters.limit)    p.set('limit',  String(filters.limit));
  if (filters.search)   p.set('search', filters.search);
  if (filters.category) p.set('category', filters.category);
  return p;
}

export const guestService = {
  async getGuests(filters: TableFilters = {}): Promise<PaginatedResponse<Guest>> {
    const params = buildParams({ limit: 20, ...filters });
    const { data } = await api.get<PaginatedResponse<Guest>>(
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

  async bulkDeleteGuests(ids: string[]): Promise<{ success: boolean; deleted: string[] }> {
    const { data } = await api.delete<{ success: boolean; deleted: string[] }>(
      `${API_ENDPOINTS.GUESTS}/bulk`, { data: { ids } }
    );
    return data;
  },

  async bulkImportGuests(guests: Array<Partial<Guest>>): Promise<{ imported: number; errors: Array<{ index: number; error: string }> }> {
    const { data } = await api.post<{ imported: number; errors: Array<{ index: number; error: string }> }>(
      `${API_ENDPOINTS.GUESTS}/bulk-import`,
      { guests }
    );
    return data;
  },

  async exportGuests(): Promise<unknown> {
    const { data } = await api.get(`${API_ENDPOINTS.GUESTS}/export`);
    return data;
  },

  async enrollFace(guestId: string, image: string): Promise<{ success: boolean }> {
    const { data } = await api.post<{ success: boolean }>(`${API_ENDPOINTS.GUESTS}/${guestId}/face`, { image });
    return data;
  },

  async linkAccount(guestId: string, userId?: string): Promise<{ success: boolean }> {
    const body = userId ? { userId } : {};
    const { data } = await api.post<{ success: boolean }>(`${API_ENDPOINTS.GUESTS}/${guestId}/link-account`, body);
    return data;
  },
};
