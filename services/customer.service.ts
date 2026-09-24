import api from '@/lib/axios';
import { unwrapList } from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import { uploadService } from './upload.service';
import type { FaceEnrollResult } from './guest.service';
import type { PaginatedResponse, TableFilters } from '@/types';
import { debugLog, maskEmail } from '@/utils/debugLog';

/** Backend customer record. `created_at` is canonical; `createdAt` is filled too for older callers. */
export interface Customer {
  id: string;
  PK?: string;
  entity_type?: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  tier?: string;
  balance?: number;
  visits?: number;
  allergyNotes?: string;
  preferredContact?: string;
  nextAppointment?: string;
  face_enrolled?: boolean;
  face_photo_url?: string;
  created_at?: string;
  createdAt?: string;
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
  /** Required by the backend — a create without it is rejected with 400. */
  address: string;
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

import { popup } from '@/lib/popup';

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

  /** Export returns the rows themselves — `downloadUrl` is always null, so never advertise a file link. */
  async exportCustomers(): Promise<CustomerExportResult> {
    const { data } = await api.get(`${API_ENDPOINTS.CUSTOMERS}/export`);
    const list = unwrapList<Customer>(data);
    return list.length ? { data: list } : {};
  },

  /** Enrols the captured photo as this customer's face — S3 upload first, then index by `s3_key`. Re-enrolling replaces the previous face. */
  async enrollFace(customerId: string, imageDataUrl: string): Promise<FaceEnrollResult> {
    console.log('[CUSTOMER-FACE] Step 1: Starting face enrollment for customer:', customerId);
    popup.info('📸 Step 1/3: Uploading photo to S3…', { id: 'customer-face-enroll' });

    let s3Key: string;
    try {
      s3Key = await uploadService.uploadImageDataUrl(imageDataUrl, 'face_enroll_customer');
      console.log('[CUSTOMER-FACE] Step 2: S3 upload complete. s3_key:', s3Key);
      popup.info('✅ Step 2/3: Photo uploaded to S3. Calling face enroll API…', { id: 'customer-face-enroll' });
    } catch (err: any) {
      console.error('[CUSTOMER-FACE] S3 upload FAILED:', err?.message);
      popup.error(`❌ S3 upload failed: ${err?.message || 'Unknown error'}`, { id: 'customer-face-enroll' });
      throw err;
    }

    try {
      const endpoint = `${API_ENDPOINTS.CUSTOMERS}/${customerId}/face`;
      console.log('[CUSTOMER-FACE] Step 3: Calling POST', endpoint, '{ s3_key:', s3Key, '}');
      const { data } = await api.post(endpoint, { s3_key: s3Key });
      console.log('[CUSTOMER-FACE] Step 4: API response ✅', JSON.stringify(data));
      popup.success('✅ Step 3/3: Face enroll API responded successfully!', { id: 'customer-face-enroll' });
      return data;
    } catch (err: any) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.error ?? err?.response?.data?.message ?? err?.message;
      console.error('[CUSTOMER-FACE] Face enroll API FAILED — status:', status, 'error:', msg);
      popup.error(`❌ Face enroll API failed (${status}): ${msg}`, { id: 'customer-face-enroll' });
      throw err;
    }
  },

  async unenrollFace(customerId: string): Promise<void> {
    const endpoint = `${API_ENDPOINTS.CUSTOMERS}/${customerId}/face`;
    console.log('[CUSTOMER-FACE] Unenrolling face — DELETE', endpoint);
    popup.info('🗑️ Calling DELETE face API…', { id: 'customer-face-unenroll' });
    try {
      await api.delete(endpoint);
      console.log('[CUSTOMER-FACE] Unenroll success ✅');
      popup.success('✅ Face unenrolled via API', { id: 'customer-face-unenroll' });
    } catch (err: any) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.error ?? err?.response?.data?.message ?? err?.message;
      console.error('[CUSTOMER-FACE] Unenroll FAILED — status:', status, 'error:', msg);
      popup.error(`❌ Face unenroll failed (${status}): ${msg}`, { id: 'customer-face-unenroll' });
      throw err;
    }
  },
};
