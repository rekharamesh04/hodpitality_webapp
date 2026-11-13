import api, { unwrapList } from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';

/**
 * School excuse notes.
 *
 * A doctor (or an administrator, in a doctor's name) issues one for a visit; anyone at the desk
 * may download it or email it again. The backend draws the PDF from the note itself each time,
 * so there is no file to upload or lose. See app/school_notes.py in the API.
 */

export type SchoolNoteRecipient = 'guardian' | 'school' | 'patient';

export interface SchoolNoteDelivery {
  to: SchoolNoteRecipient;
  email?: string;
  name?: string;
  at?: string;
  by?: string;
  ok: boolean;
  /** Only on the result of a send that was refused or failed. */
  error?: string;
  code?: string;
}

export interface SchoolNote {
  id: string;
  /** "SN-7KQ4-2MXP" — printed on the note, quoted by a school that wants to check it. */
  code: string;
  status: 'issued' | 'void';
  personId: string;
  personName: string;
  dateOfBirth?: string;
  schoolName?: string;
  schoolGrade?: string;
  appointmentId?: string;
  visitDate: string;
  timeIn?: string;
  timeOut?: string;
  returnDate: string;
  restrictions?: string;
  restrictionsUntil?: string;
  comment?: string;
  doctorStaffId?: string;
  doctorName?: string;
  issuedAt: string;
  issuedBy?: string;
  deliveries?: SchoolNoteDelivery[];
  voidedAt?: string;
  voidedBy?: string;
  voidReason?: string;
  /** On a create or send response: what happened to each recipient just now. */
  sent?: SchoolNoteDelivery[];
}

export interface CreateSchoolNotePayload {
  personId: string;
  appointmentId?: string;
  visitDate?: string;
  timeIn?: string;
  timeOut?: string;
  returnDate: string;
  restrictions?: string;
  restrictionsUntil?: string;
  comment?: string;
  doctorStaffId?: string;
  sendTo?: SchoolNoteRecipient[];
}

export interface SchoolNoteFilters {
  personId?: string;
  appointmentId?: string;
  code?: string;
}

interface PdfFile {
  fileName: string;
  contentType: string;
  data: string;
}

function base64ToBlob(data: string, contentType: string): Blob {
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: contentType });
}

export const schoolNoteService = {
  async list(filters: SchoolNoteFilters): Promise<SchoolNote[]> {
    const params = new URLSearchParams();
    if (filters.personId) params.set('personId', filters.personId);
    if (filters.appointmentId) params.set('appointmentId', filters.appointmentId);
    if (filters.code) params.set('code', filters.code);
    const { data } = await api.get(`${API_ENDPOINTS.SCHOOL_NOTES}?${params}`);
    return unwrapList<SchoolNote>(data);
  },

  async create(payload: CreateSchoolNotePayload): Promise<SchoolNote> {
    const { data } = await api.post<SchoolNote>(API_ENDPOINTS.SCHOOL_NOTES, payload);
    return data;
  },

  async send(id: string, to: SchoolNoteRecipient): Promise<SchoolNote> {
    const { data } = await api.post<SchoolNote>(`${API_ENDPOINTS.SCHOOL_NOTES}/${id}/send`, { to });
    return data;
  },

  async voidNote(id: string, reason: string): Promise<SchoolNote> {
    const { data } = await api.post<SchoolNote>(`${API_ENDPOINTS.SCHOOL_NOTES}/${id}/void`, { reason });
    return data;
  },

  /** Fetch the PDF and hand it to the browser as a download. */
  async download(id: string): Promise<void> {
    const { data } = await api.get<PdfFile>(`${API_ENDPOINTS.SCHOOL_NOTES}/${id}/pdf`);
    const blob = base64ToBlob(data.data, data.contentType || 'application/pdf');
    const url = URL.createObjectURL(blob);
    try {
      const link = document.createElement('a');
      link.href = url;
      link.download = data.fileName || 'school-note.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
    } finally {
      // Give the browser a moment to start the download before the URL goes.
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    }
  },
};
