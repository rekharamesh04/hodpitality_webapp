import api from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import type { PresignedUrlResponse } from '@/types';

export const uploadService = {
  /** Request a pre-signed S3 upload URL. Use the returned `uploadUrl` to PUT the file directly to S3. */
  async getPresignedUrl(fileName: string, contentType: string): Promise<PresignedUrlResponse> {
    const { data } = await api.post<PresignedUrlResponse>(
      API_ENDPOINTS.UPLOADS.PRESIGNED_URL,
      { fileName, contentType }
    );
    return data;
  },

  /** Get URL then upload file directly to S3 via PUT. Returns the public fileUrl. */
  async uploadFile(file: File): Promise<string> {
    const { uploadUrl, fileUrl } = await uploadService.getPresignedUrl(file.name, file.type);
    await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type },
    });
    return fileUrl;
  },
};
