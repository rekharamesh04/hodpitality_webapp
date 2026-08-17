import api from '@/lib/axios';
import { unwrapList } from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import type { Staff, TableFilters } from '@/types';

export const staffService = {
  async getStaff(filters: TableFilters = {}): Promise<Staff[]> {
    const p = new URLSearchParams();
    if (filters.search) p.set('search', filters.search);
    if (filters.status) p.set('status', filters.status);
    const { data } = await api.get(`${API_ENDPOINTS.STAFF}?${p}`);
    return unwrapList<Staff>(data);
  },

  async getStaffMember(id: string): Promise<Staff> {
    const { data } = await api.get<Staff>(`${API_ENDPOINTS.STAFF}/${id}`);
    return data;
  },

  async createStaff(input: Partial<Staff>): Promise<Staff> {
    const { data } = await api.post<Staff>(API_ENDPOINTS.STAFF, input);
    return data;
  },

  async updateStaff(id: string, input: Partial<Staff>): Promise<Staff> {
    const { data } = await api.put<Staff>(`${API_ENDPOINTS.STAFF}/${id}`, input);
    return data;
  },

  async deleteStaff(id: string): Promise<void> {
    await api.delete(`${API_ENDPOINTS.STAFF}/${id}`);
  },

  async updateSchedule(id: string, schedule: Record<string, unknown>): Promise<Staff> {
    const { data } = await api.put<Staff>(`${API_ENDPOINTS.STAFF}/${id}/schedule`, { schedule });
    return data;
  },
};
