import api from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import type { Reseller, CursorPaginatedResponse, TableFilters } from '@/types';

export const resellerService = {
  async getResellers(filters: TableFilters = {}): Promise<CursorPaginatedResponse<Reseller>> {
    const p = new URLSearchParams();
    p.set('limit', String(filters.limit ?? 50));
    if (filters.cursor) p.set('cursor', filters.cursor);
    if (filters.search) p.set('search', filters.search);
    const { data } = await api.get<CursorPaginatedResponse<Reseller>>(
      `${API_ENDPOINTS.RESELLERS}?${p}`
    );
    return data;
  },

  async getReseller(id: string): Promise<Reseller> {
    const { data } = await api.get<Reseller>(`${API_ENDPOINTS.RESELLERS}/${id}`);
    return data;
  },

  async createReseller(input: Partial<Reseller>): Promise<Reseller> {
    const { data } = await api.post<Reseller>(API_ENDPOINTS.RESELLERS, input);
    return data;
  },

  async updateReseller(id: string, input: Partial<Reseller>): Promise<Reseller> {
    const { data } = await api.put<Reseller>(`${API_ENDPOINTS.RESELLERS}/${id}`, input);
    return data;
  },

  async deleteReseller(id: string): Promise<void> {
    await api.delete(`${API_ENDPOINTS.RESELLERS}/${id}`);
  },
};
