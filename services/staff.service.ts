import api from '@/lib/axios';
import { unwrapList, FULL_LIST_LIMIT } from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import type { NpiLookupResult, Staff, TableFilters } from '@/types';

export interface StaffFilters extends Omit<TableFilters, 'status'> {
  status?: string;
  /** Only this role — e.g. company_admin, for listing each organisation's admins. */
  role?: string;
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
  /** US NPI. On update, "" clears it; leaving it out leaves it alone. */
  npi?: string;
}

export type UpdateStaffPayload = Partial<Omit<CreateStaffPayload, 'email'>>;

function buildParams(filters: StaffFilters): URLSearchParams {
  const p = new URLSearchParams();
  if (filters.search) p.set('search', filters.search);
  if (filters.status) p.set('status', filters.status);
  if (filters.role) p.set('role', filters.role);
  p.set('limit', String(FULL_LIST_LIMIT));
  return p;
}

export const staffService = {
  /** GET /staff returns a flat, unpaginated list (no page/limit/total) — the page windows it client-side. */
  async getStaff(filters: StaffFilters = {}): Promise<Staff[]> {
    const p = buildParams(filters);
    const { data } = await api.get(`${API_ENDPOINTS.STAFF}?${p}`);
    return unwrapList<Staff>(data);
  },

  /**
   * What the US NPI Registry says about `npi` (read-only; the server calls the registry).
   * `tenantId`: the organisation being saved to, for the duplicate check. `staffId`: the person being edited.
   */
  async lookupNpi(npi: string, opts: { tenantId?: string; staffId?: string } = {}): Promise<NpiLookupResult> {
    const p = new URLSearchParams();
    if (opts.tenantId) p.set('tenant_id', opts.tenantId);
    if (opts.staffId) p.set('staffId', opts.staffId);
    const qs = p.toString();
    const { data } = await api.get<NpiLookupResult>(`/npi/${encodeURIComponent(npi)}${qs ? `?${qs}` : ''}`);
    return data;
  },

  /**
   * Doctors in the US NPI Registry by name ("Coburn Allen", "Allen, TX"). At most 10, active
   * individual providers only; each says whether this organisation already has that NPI.
   */
  async searchNpi(query: string, opts: { tenantId?: string; staffId?: string } = {}): Promise<NpiLookupResult[]> {
    const p = new URLSearchParams({ q: query });
    if (opts.tenantId) p.set('tenant_id', opts.tenantId);
    if (opts.staffId) p.set('staffId', opts.staffId);
    const { data } = await api.get<{ data: NpiLookupResult[] }>(`/npi/search?${p}`);
    return Array.isArray(data?.data) ? data.data : [];
  },

  async getStaffMember(id: string): Promise<Staff> {
    const { data } = await api.get<Staff>(`${API_ENDPOINTS.STAFF}/${id}`);
    return data;
  },

  async createStaff(input: CreateStaffPayload): Promise<Staff> {
    const { data } = await api.post<Staff>(API_ENDPOINTS.STAFF, input);
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
