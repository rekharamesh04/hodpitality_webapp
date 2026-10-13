import api from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';

/**
 * HeyCyan smart glasses, from the browser — by way of the user's own phone.
 *
 * A web page cannot talk to the glasses. They take a photo on a Bluetooth command and hand it
 * over Wi-Fi Direct, served as plain http:// from the glasses' own address: there is no Wi-Fi
 * Direct API in any browser, and an https page may not fetch an http address on the local network.
 * Web Bluetooth could fire the shutter, but the photo would stay on the glasses.
 *
 * So the portal asks the backend for a photo, and the EntryFlow Android app — signed in as the same
 * person, glasses connected, Desk Link open — takes it and uploads it. The portal then reads the
 * photo back and carries on exactly as if it had come from the webcam.
 */

export type GlassesCapturePurpose = 'enroll' | 'identify';

export type GlassesCaptureStatus = 'pending' | 'capturing' | 'captured' | 'failed' | 'cancelled' | 'expired';

export interface GlassesCapture {
  id: string;
  purpose: GlassesCapturePurpose;
  subjectLabel: string;
  status: GlassesCaptureStatus;
  expiresInSeconds: number;
  /** When the phone took the request; empty while it is still pending. */
  claimedAt?: string;
  /** Set once captured. */
  s3_key: string;
  /** A short-lived signed URL for the captured photo. */
  photoUrl?: string;
  /** Why the phone could not take it, once failed. */
  error: string;
}

/** Longest edge of the photo handed on — the same bound the webcam dialog applies to an upload. */
const MAX_EDGE = 1600;

/** Re-encodes an image as a bounded JPEG data URL, the shape every face flow already accepts. */
async function toJpegDataUrl(blob: Blob): Promise<string> {
  const objectUrl = URL.createObjectURL(blob);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('The photo from the glasses could not be read.'));
      el.src = objectUrl;
    });
    const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('The photo from the glasses could not be read.');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.9);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export const glassesService = {
  /** Ask the signed-in user's phone for a photo. Replaces any request it had not finished. */
  async request(purpose: GlassesCapturePurpose, subjectLabel?: string): Promise<GlassesCapture> {
    const { data } = await api.post<GlassesCapture>(API_ENDPOINTS.GLASSES_CAPTURES, { purpose, subjectLabel });
    return data;
  },

  async get(id: string): Promise<GlassesCapture> {
    const { data } = await api.get<GlassesCapture>(`${API_ENDPOINTS.GLASSES_CAPTURES}/${id}`);
    return data;
  },

  /** Stop waiting. A 409 means it had already finished, which is fine. */
  async cancel(id: string): Promise<void> {
    await api.post(`${API_ENDPOINTS.GLASSES_CAPTURES}/${id}/cancel`).catch(() => undefined);
  },

  /**
   * The captured photo as a data URL. The bucket is private, so it is read through the signed
   * URL — S3's CORS rules already allow GET from the portal's origins.
   */
  async photoAsDataUrl(photoUrl: string): Promise<string> {
    const res = await fetch(photoUrl);
    if (!res.ok) throw new Error(`Could not fetch the photo from the glasses (${res.status}).`);
    return toJpegDataUrl(await res.blob());
  },
};
