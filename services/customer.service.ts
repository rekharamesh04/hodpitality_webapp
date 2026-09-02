import api from '@/lib/axios';
import { unwrapList } from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import type { PaginatedResponse, TableFilters } from '@/types';
import { debugLog, maskEmail } from '@/utils/debugLog';

/** Backend customer record. Field naming is inconsistent in places (createdAt vs created_at) — treat everything but id/name/email/phone as optional and read both spellings where relevant. */
export interface Customer {
  id: string;
  PK?: string;
  entity_type?: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  designation?: string;
  tier?: string;
  balance?: number;
  visits?: number;
  allergyNotes?: string;
  preferredContact?: string;
  nextAppointment?: string;
  createdAt?: string;
  created_at?: string;
  [key: string]: unknown;
}

export type CustomerListResponse = PaginatedResponse<Customer>;

export interface CustomerFilters extends TableFilters {
  tier?: string;
}

export interface CreateCustomerPayload {
  name: string;
  email: string;
  phone: string;
  company?: string;
  designation?: string;
  tier?: string;
  balance?: number;
  visits?: number;
  allergyNotes?: string;
  preferredContact?: string;
  nextAppointment?: string;
}

export type UpdateCustomerPayload = Partial<CreateCustomerPayload>;

export interface CustomerExportResult {
  downloadUrl?: string;
  data?: Customer[];
}

function buildParams(filters: CustomerFilters): URLSearchParams {
  const p = new URLSearchParams();
  if (filters.page)   p.set('page',   String(filters.page));
  if (filters.limit)  p.set('limit',  String(filters.limit));
  if (filters.search) p.set('search', filters.search);
  if (filters.tier)   p.set('tier',   filters.tier);
  return p;
}

export const customerService = {
  async getCustomers(filters: CustomerFilters = {}): Promise<CustomerListResponse> {
    const params = buildParams({ limit: 20, ...filters });
    const { data } = await api.get<CustomerListResponse>(
      `${API_ENDPOINTS.CUSTOMERS}?${params}`
    );
    return data;
  },

  async getCustomer(id: string): Promise<Customer> {
    const { data } = await api.get<Customer>(`${API_ENDPOINTS.CUSTOMERS}/${id}`);
    debugLog('[ADMIN][CUSTOMER][FETCH]', {
      customerId: data?.id ?? null,
      userId: data?.userId ?? null,
      guestId: data?.guestId ?? null,
      email: maskEmail(data?.email),
      tenantId: data?.tenantId ?? null,
    });
    return data;
  },

  async createCustomer(input: CreateCustomerPayload): Promise<Customer> {
    const { data } = await api.post<Customer>(API_ENDPOINTS.CUSTOMERS, input);
    return data;
  },

  async updateCustomer(id: string, input: UpdateCustomerPayload): Promise<Customer> {
    const { data } = await api.put<Customer>(`${API_ENDPOINTS.CUSTOMERS}/${id}`, input);
    return data;
  },

  async deleteCustomer(id: string): Promise<void> {
    await api.delete(`${API_ENDPOINTS.CUSTOMERS}/${id}`);
  },

  /** The export endpoint may return either a downloadable URL or the raw record set — never fabricate a download if neither shape is present. */
  async exportCustomers(): Promise<CustomerExportResult> {
    const { data } = await api.get(`${API_ENDPOINTS.CUSTOMERS}/export`);
    if (data && typeof data === 'object' && !Array.isArray(data) && typeof (data as { downloadUrl?: unknown }).downloadUrl === 'string') {
      return { downloadUrl: (data as { downloadUrl: string }).downloadUrl };
    }
    const list = unwrapList<Customer>(data);
    return list.length ? { data: list } : {};
  },

  async enrollFace(customerId: string, payload: { image?: string; s3_key?: string }): Promise<{ success: boolean; message?: string; faceId?: string }> {
    const { data } = await api.post(`${API_ENDPOINTS.CUSTOMERS}/${customerId}/face`, payload);
    return data;
  },
};
