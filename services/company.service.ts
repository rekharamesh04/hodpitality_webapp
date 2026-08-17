import api from '@/lib/axios';
import { unwrapList } from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import type { Company, TableFilters } from '@/types';

export const companyService = {
  async getCompanies(filters: TableFilters = {}): Promise<Company[]> {
    const p = new URLSearchParams();
    if (filters.search) p.set('search', filters.search);
    const { data } = await api.get(`${API_ENDPOINTS.COMPANIES}?${p}`);
    return unwrapList<Company>(data);
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
