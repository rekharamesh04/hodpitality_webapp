import api from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import type { PresignedUrlResponse } from '@/types';

/** Decodes a `data:<mime>;base64,...` URL (what CameraCaptureDialog produces) into raw bytes S3 can store. */
function dataUrlToBlob(dataUrl: string): { blob: Blob; contentType: string } {
  const match = /^data:([^;,]+);base64,([\s\S]*)$/.exec(dataUrl);
  if (!match) throw new Error('Unsupported image format — please retake or upload the photo again.');
  const contentType = match[1];
  const binary = atob(match[2]);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return { blob: new Blob([bytes], { type: contentType }), contentType };
}

/**
 * A local/mock session's presigned response is a placeholder (`uploadUrl: '#'`), so
 * there is no S3 to transfer to — the mock backend answers the face endpoints from
 * its own data regardless of the key.
 */
function isRealUploadUrl(url: string | undefined): boolean {
  return !!url && /^https?:\/\//i.test(url);
}

/**
 * PUT straight to S3. No Authorization/x-api-key header: a presigned URL is
 * self-contained and any extra header breaks its signature check. Content-Type must
 * match exactly what was sent to /uploads/presigned-url or S3 rejects the signature.
 */
async function putToS3(uploadUrl: string, body: Blob | File, contentType: string): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    body,
    headers: { 'Content-Type': contentType },
  });
  if (!res.ok) throw new Error(`Upload failed (${res.status})`);
}

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
    const presigned = await uploadService.getPresignedUrl(file.name, file.type);
    if (isRealUploadUrl(presigned.uploadUrl)) {
      await putToS3(presigned.uploadUrl, file, file.type);
    }
    return presigned.fileUrl;
  },

  /**
   * Uploads a captured photo to S3 and returns its object key.
   *
   * The face endpoints (`POST /check-ins/facial-recognition`, `POST /guests|customers/{id}/face`)
   * take an `s3_key` and let Rekognition read the image straight out of the bucket, so the
   * photo never travels through API Gateway as a base64 body. This is the same two-step flow
   * the EntryFlow mobile app uses against this backend.
   */
  async uploadImageDataUrl(dataUrl: string, namePrefix: string): Promise<string> {
    const { blob, contentType } = dataUrlToBlob(dataUrl);
    const extension = contentType === 'image/png' ? 'png' : 'jpg';
    const fileName = `${namePrefix}_${Date.now()}.${extension}`;

    const presigned = await uploadService.getPresignedUrl(fileName, contentType);
    if (isRealUploadUrl(presigned.uploadUrl)) {
      await putToS3(presigned.uploadUrl, blob, contentType);
    }
    return presigned.objectKey ?? `uploads/${fileName}`;
  },
};
