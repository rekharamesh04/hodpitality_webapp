import api from '@/lib/axios';
import { unwrapList } from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import type { Reseller } from '@/types';

export interface CreateResellerPayload {
  name: string;
  /** Optional at the backend — supplying it triggers a Cognito reseller-admin invite. */
  email?: string;
  phone?: string;
}

export type UpdateResellerPayload = Partial<Omit<CreateResellerPayload, 'email'>> & {
  status?: Reseller['status'];
};

export const resellerService = {
  /**
   * GET /resellers — super_admin only; returns a flat, unpaginated list. No query
   * parameters are confirmed on this endpoint (no `search`), so filtering happens
   * client-side over the fetched set.
   */
  async getResellers(): Promise<Reseller[]> {
    const { data } = await api.get(API_ENDPOINTS.RESELLERS);
    return unwrapList<Reseller>(data);
  },

  async createReseller(input: CreateResellerPayload): Promise<Reseller> {
    const { data } = await api.post<Reseller>(API_ENDPOINTS.RESELLERS, input);
    return data;
  },

  async updateReseller(id: string, input: UpdateResellerPayload): Promise<Reseller> {
    const { data } = await api.put<Reseller>(`${API_ENDPOINTS.RESELLERS}/${id}`, input);
    return data;
  },

  async deleteReseller(id: string): Promise<void> {
    await api.delete(`${API_ENDPOINTS.RESELLERS}/${id}`);
  },
};
