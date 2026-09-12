import api from '@/lib/axios';
import { unwrapList } from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import { uploadService } from './upload.service';
import type { Guest, PaginatedResponse, TableFilters } from '@/types';

export type GuestListResponse = PaginatedResponse<Guest>;

export interface FaceEnrollResult {
  success: boolean;
  message?: string;
  faceId?: string;
  face_photo_url?: string;
}

export interface GuestFilters extends TableFilters {
  category?: string;
}

export interface CreateGuestPayload {
  name: string;
  email: string;
  phone: string;
  /** Required by the backend — a create without it is rejected with 400. */
  address: string;
  category?: Guest['category'];
  notes?: string;
  /** Rarely set directly by the Guest form (the backend defaults these) — used by the registration workflow, which seeds a guest record ahead of check-in. */
  status?: Guest['status'];
  checkedIn?: boolean;
  registrationDate?: string;
  tags?: string[];
}

export type UpdateGuestPayload = Partial<CreateGuestPayload>;

export interface GuestExportResult {
  downloadUrl?: string;
  data?: Guest[];
}

function buildParams(filters: GuestFilters): URLSearchParams {
  const p = new URLSearchParams();
  if (filters.page)     p.set('page',   String(filters.page));
  if (filters.limit)    p.set('limit',  String(filters.limit));
  if (filters.search)   p.set('search', filters.search);
  if (filters.category) p.set('category', filters.category);
  return p;
}

export const guestService = {
  async getGuests(filters: GuestFilters = {}): Promise<GuestListResponse> {
    const params = buildParams({ limit: 20, ...filters });
    const { data } = await api.get<GuestListResponse>(
      `${API_ENDPOINTS.GUESTS}?${params}`
    );
    return data;
  },

  async getGuest(id: string): Promise<Guest> {
    const { data } = await api.get<Guest>(`${API_ENDPOINTS.GUESTS}/${id}`);
    return data;
  },

  async createGuest(input: CreateGuestPayload): Promise<Guest> {
    const { data } = await api.post<Guest>(API_ENDPOINTS.GUESTS, input);
    return data;
  },

  async updateGuest(id: string, input: UpdateGuestPayload): Promise<Guest> {
    const { data } = await api.put<Guest>(`${API_ENDPOINTS.GUESTS}/${id}`, input);
    return data;
  },

  async deleteGuest(id: string): Promise<void> {
    await api.delete(`${API_ENDPOINTS.GUESTS}/${id}`);
  },

  async bulkDeleteGuests(ids: string[]): Promise<{ success: boolean; deleted: string[] }> {
    const { data } = await api.delete<{ success: boolean; deleted: string[] }>(
      `${API_ENDPOINTS.GUESTS}/bulk`, { data: { ids } }
    );
    return data;
  },

  async bulkImportGuests(guests: Array<Partial<Guest>>): Promise<{ imported: number; errors: Array<{ index: number; error: string }> }> {
    const { data } = await api.post<{ imported: number; errors: Array<{ index: number; error: string }> }>(
      `${API_ENDPOINTS.GUESTS}/bulk-import`,
      { guests }
    );
    return data;
  },

  /** Export returns the rows themselves — `downloadUrl` is always null, so never advertise a file link. */
  async exportGuests(): Promise<GuestExportResult> {
    const { data } = await api.get(`${API_ENDPOINTS.GUESTS}/export`);
    const list = unwrapList<Guest>(data);
    return list.length ? { data: list } : {};
  },

  /**
   * Enrolls the captured photo as this guest's face. The image goes to S3 first and is indexed
   * by its `s3_key`; re-enrolling replaces the previous face rather than adding a second one.
   */
  async enrollFace(guestId: string, imageDataUrl: string): Promise<FaceEnrollResult> {
    const s3Key = await uploadService.uploadImageDataUrl(imageDataUrl, 'face_enroll_guest');
    const { data } = await api.post(`${API_ENDPOINTS.GUESTS}/${guestId}/face`, { s3_key: s3Key });
    return data;
  },

  async unenrollFace(guestId: string): Promise<void> {
    await api.delete(`${API_ENDPOINTS.GUESTS}/${guestId}/face`);
  },
};
