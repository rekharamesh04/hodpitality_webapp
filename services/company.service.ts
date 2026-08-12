import api from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import type { Company, CursorPaginatedResponse, TableFilters } from '@/types';

export const companyService = {
  async getCompanies(filters: TableFilters = {}): Promise<CursorPaginatedResponse<Company>> {
    const p = new URLSearchParams();
    p.set('limit', String(filters.limit ?? 50));
    if (filters.cursor) p.set('cursor', filters.cursor);
    if (filters.search) p.set('search', filters.search);
    const { data } = await api.get<CursorPaginatedResponse<Company>>(
      `${API_ENDPOINTS.COMPANIES}?${p}`
    );
    return data;
  },

  async getCompany(id: string): Promise<Company> {
    const { data } = await api.get<Company>(`${API_ENDPOINTS.COMPANIES}/${id}`);
    return data;
  },

  async createCompany(input: Partial<Company>): Promise<Company> {
    const { data } = await api.post<Company>(API_ENDPOINTS.COMPANIES, input);
    return data;
  },

  async updateCompany(id: string, input: Partial<Company>): Promise<Company> {
    const { data } = await api.put<Company>(`${API_ENDPOINTS.COMPANIES}/${id}`, input);
    return data;
  },

  async deleteCompany(id: string): Promise<void> {
    await api.delete(`${API_ENDPOINTS.COMPANIES}/${id}`);
  },
};
