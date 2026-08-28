import api from '@/lib/axios';
import { unwrapList } from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import type { Staff, TableFilters } from '@/types';

export interface StaffFilters extends Omit<TableFilters, 'status'> {
  status?: string;
}

export interface CreateStaffPayload {
  name: string;
  /** POST /staff is the account-invite mechanism (confirmed by the existing "Invite Admin" flow
   * in app/(dashboard)/companies/page.tsx, which calls this same service) — the backend sends a
   * real Cognito invite to this address, so it's required in practice even though the Staff
   * read type marks `email` optional. */
  email: string;
  phone?: string;
  department?: string;
  role?: string;
  status?: Staff['status'];
  tenant_id?: string;
  /** Rarely set directly by the Add Staff form (the backend defaults this to now) — accepted here too since other call sites in this codebase seed it explicitly. */
  joinedDate?: string;
}

export type UpdateStaffPayload = Partial<Omit<CreateStaffPayload, 'email'>>;

function buildParams(filters: StaffFilters): URLSearchParams {
  const p = new URLSearchParams();
  if (filters.search) p.set('search', filters.search);
  if (filters.status) p.set('status', filters.status);
  return p;
}

export const staffService = {
  /** GET /staff returns a flat, unpaginated list (no page/limit/total) — the page windows it client-side. */
  async getStaff(filters: StaffFilters = {}): Promise<Staff[]> {
    const p = buildParams(filters);
    const { data } = await api.get(`${API_ENDPOINTS.STAFF}?${p}`);
    return unwrapList<Staff>(data);
  },

  async getStaffMember(id: string): Promise<Staff> {
    const { data } = await api.get<Staff>(`${API_ENDPOINTS.STAFF}/${id}`);
    return data;
  },

  async createStaff(input: CreateStaffPayload): Promise<Staff> {
    console.log('[INVITE] createStaff payload →', JSON.stringify(input));
    const { data } = await api.post<Staff>(API_ENDPOINTS.STAFF, input);
    console.log('[INVITE] createStaff response ←', JSON.stringify(data));
    return data;
  },

  async updateStaff(id: string, input: UpdateStaffPayload): Promise<Staff> {
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
