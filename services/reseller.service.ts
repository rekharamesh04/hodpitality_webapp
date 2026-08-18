import api from '@/lib/axios';
import { unwrapList } from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import type { Reseller, TableFilters } from '@/types';

export const resellerService = {
  async getResellers(filters: TableFilters = {}): Promise<Reseller[]> {
    const p = new URLSearchParams();
    if (filters.search) p.set('search', filters.search);
    const { data } = await api.get(`${API_ENDPOINTS.RESELLERS}?${p}`);
    return unwrapList<Reseller>(data);
  },

  async getReseller(id: string): Promise<Reseller> {
    const { data } = await api.get<Reseller>(`${API_ENDPOINTS.RESELLERS}/${id}`);
    return data;
  },

  async createReseller(input: Partial<Reseller>): Promise<Reseller> {
    console.log('[INVITE] createReseller payload →', JSON.stringify(input));
    const { data } = await api.post<Reseller>(API_ENDPOINTS.RESELLERS, input);
    console.log('[INVITE] createReseller response ←', JSON.stringify(data));
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
