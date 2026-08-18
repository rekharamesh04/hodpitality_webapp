import api from '@/lib/axios';
import { unwrapList } from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import type { PaginatedResponse, TableFilters } from '@/types';

export interface Customer {
  id: string;
  PK?: string;
  name: string;
  email: string;
  phone: string;
  tier?: string;
  visits?: number;
  allergyNotes?: string;
  nextAppointment?: string;
  createdAt?: string;
  [key: string]: unknown;
}

function buildParams(filters: TableFilters & { tier?: string }): URLSearchParams {
  const p = new URLSearchParams();
  if (filters.page)   p.set('page',   String(filters.page));
  if (filters.limit)  p.set('limit',  String(filters.limit));
  if (filters.search) p.set('search', filters.search);
  if (filters.tier)   p.set('tier',   filters.tier);
  return p;
}

export const customerService = {
  async getCustomers(filters: TableFilters & { tier?: string } = {}): Promise<PaginatedResponse<Customer>> {
    const params = buildParams({ limit: 20, ...filters });
    const { data } = await api.get<PaginatedResponse<Customer>>(
      `${API_ENDPOINTS.CUSTOMERS}?${params}`
    );
    return data;
  },

  async getCustomer(id: string): Promise<Customer> {
    const { data } = await api.get<Customer>(`${API_ENDPOINTS.CUSTOMERS}/${id}`);
    return data;
  },

  async createCustomer(input: Partial<Customer>): Promise<Customer> {
    const { data } = await api.post<Customer>(API_ENDPOINTS.CUSTOMERS, input);
    return data;
  },

  async updateCustomer(id: string, input: Partial<Customer>): Promise<Customer> {
    const { data } = await api.put<Customer>(`${API_ENDPOINTS.CUSTOMERS}/${id}`, input);
    return data;
  },

  async deleteCustomer(id: string): Promise<void> {
    await api.delete(`${API_ENDPOINTS.CUSTOMERS}/${id}`);
  },

  async exportCustomers(): Promise<Customer[]> {
    const { data } = await api.get(`${API_ENDPOINTS.CUSTOMERS}/export`);
    return unwrapList<Customer>(data);
  },

  async enrollFace(customerId: string, image: string): Promise<{ success: boolean }> {
    const { data } = await api.post<{ success: boolean }>(
      `${API_ENDPOINTS.CUSTOMERS}/${customerId}/face`,
      { image }
    );
    return data;
  },

  async linkAccount(customerId: string, userId?: string): Promise<{ success: boolean }> {
    const body = userId ? { userId } : {};
    const { data } = await api.post<{ success: boolean }>(
      `${API_ENDPOINTS.CUSTOMERS}/${customerId}/link-account`,
      body
    );
    return data;
  },
};
