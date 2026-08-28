const PREFIX = 'guest-avatar:';

/**
 * The face-enroll API only confirms success/faceId — it never returns a
 * viewable photo, and GET /guests doesn't come back with one either. Until
 * the backend persists and returns a photo URL, we keep the just-captured
 * image here so the UI can show what was actually enrolled.
 */
export function getLocalAvatar(guestId: string): string | undefined {
  if (typeof window === 'undefined' || !guestId) return undefined;
  try {
    return localStorage.getItem(PREFIX + guestId) ?? undefined;
  } catch {
    return undefined;
  }
}

export function setLocalAvatar(guestId: string, dataUrl: string): void {
  if (typeof window === 'undefined' || !guestId) return;
  try {
    localStorage.setItem(PREFIX + guestId, dataUrl);
  } catch {
    // storage full/unavailable — the enrolled photo just won't persist locally
  }
}
