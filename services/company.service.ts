import api from '@/lib/axios';
import { unwrapList } from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import type { Company } from '@/types';
import type { IndustrySlug } from '@/constants/industry';

export interface CreateCompanyPayload {
  name: string;
  /** Optional at the backend — supplying it triggers a Cognito company_admin invite. */
  email?: string;
  /** Super-admin-only: assigns the new company to a specific reseller. Reseller users never
   * send this — the backend derives it from the authenticated caller's own tenant. */
  reseller_id?: string;
  /**
   * Decides the vocabulary this tenant's staff see. Omitted means the backend's
   * neutral default; an unknown slug is refused with a 400 rather than defaulted,
   * so a typo cannot silently mislabel a whole tenant.
   */
  industry?: IndustrySlug;
}

/**
 * `industry` is accepted here but the backend refuses it from a `company_admin`
 * — reclassifying a tenant is the account manager's call, not the tenant's.
 */
export type UpdateCompanyPayload = Pick<Partial<CreateCompanyPayload>, 'name' | 'email' | 'industry'>;

export const companyService = {
  /**
   * GET /companies — the backend RBAC-filters the response by caller (all companies for
   * admin, own reseller's companies for reseller_admin, own company for company_admin).
   * No query parameters are confirmed on this endpoint (no `search`), so filtering happens
   * client-side over the fetched set.
   */
  async getCompanies(): Promise<Company[]> {
    const { data } = await api.get(API_ENDPOINTS.COMPANIES);
    return unwrapList<Company>(data);
  },

  async createCompany(input: CreateCompanyPayload): Promise<Company> {
    const { data } = await api.post<Company>(API_ENDPOINTS.COMPANIES, input);
    return data;
  },

  async updateCompany(id: string, input: UpdateCompanyPayload): Promise<Company> {
    const { data } = await api.put<Company>(`${API_ENDPOINTS.COMPANIES}/${id}`, input);
    return data;
  },

  async deleteCompany(id: string): Promise<void> {
    await api.delete(`${API_ENDPOINTS.COMPANIES}/${id}`);
  },
};
