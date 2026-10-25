'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { glassesService, type GlassesCapture, type GlassesCapturePurpose } from '@/services/glasses.service';
import { getFriendlyErrorMessage } from '@/lib/utils';

/** How often the portal checks on its request. The phone polls every 3s, so 2s keeps the round trip short. */
const POLL_MS = 2000;

export type GlassesCapturePhase = 'idle' | 'waiting' | 'capturing' | 'fetching' | 'failed';

export interface GlassesCaptureState {
  phase: GlassesCapturePhase;
  /** What to tell the user, in the current phase. */
  message: string;
}

const IDLE: GlassesCaptureState = { phase: 'idle', message: '' };

/** The words for a request that ended without a photo. */
function endedMessage(capture: GlassesCapture): string {
  switch (capture.status) {
    case 'failed': return capture.error || 'Your phone could not take the photo.';
    case 'expired':
      return capture.claimedAt
        ? 'The photo took too long. Check the glasses are on and close to the phone, then try again.'
        : 'Your phone did not pick this up. Open Profile → Desk Link in the EntryFlow app, signed in as you.';
    case 'cancelled': return 'This request was replaced by a newer one.';
    default: return 'The photo could not be taken.';
  }
}

/**
 * Take one photo with the user's smart glasses, through their phone.
 *
 * `start` asks for it and follows the request until the photo is back, then calls `onPhoto` with a
 * data URL — the same thing the webcam produces, so every face flow takes it unchanged. Closing the
 * caller (unmount) or `cancel` withdraws a request still in flight, so the phone never fires a
 * shutter nobody is waiting for.
 */
export function useGlassesCapture(onPhoto: (dataUrl: string) => void) {
  const [state, setState] = useState<GlassesCaptureState>(IDLE);
  const activeId = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onPhotoRef = useRef(onPhoto);
  onPhotoRef.current = onPhoto;

  const stopPolling = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  const follow = useCallback(async (id: string) => {
    if (activeId.current !== id) return;
    try {
      const capture = await glassesService.get(id);
      if (activeId.current !== id) return;
      if (capture.status === 'pending') {
        setState({ phase: 'waiting', message: 'Waiting for your phone… Keep Desk Link open in the EntryFlow app.' });
      } else if (capture.status === 'capturing') {
        setState({ phase: 'capturing', message: 'Your phone is taking the photo — look at the person now.' });
      } else if (capture.status === 'captured' && capture.photoUrl) {
        setState({ phase: 'fetching', message: 'Getting the photo…' });
        const dataUrl = await glassesService.photoAsDataUrl(capture.photoUrl);
        void glassesService.received(id);
        if (activeId.current !== id) return;
        activeId.current = null;
        setState(IDLE);
        onPhotoRef.current(dataUrl);
        return;
      } else {
        activeId.current = null;
        setState({ phase: 'failed', message: endedMessage(capture) });
        return;
      }
    } catch (err) {
      if (activeId.current !== id) return;
      activeId.current = null;
      setState({ phase: 'failed', message: getFriendlyErrorMessage(err, 'Lost touch with the glasses request. Try again.') });
      return;
    }
    timer.current = setTimeout(() => follow(id), POLL_MS);
  }, []);

  const start = useCallback(async (purpose: GlassesCapturePurpose, subjectLabel?: string) => {
    stopPolling();
    setState({ phase: 'waiting', message: 'Sending to your phone…' });
    try {
      const capture = await glassesService.request(purpose, subjectLabel);
      activeId.current = capture.id;
      follow(capture.id);
    } catch (err: any) {
      setState({ phase: 'failed', message: err?.backendMessage ?? getFriendlyErrorMessage(err, 'Could not reach your phone.') });
    }
  }, [follow]);

  const cancel = useCallback(() => {
    stopPolling();
    const id = activeId.current;
    activeId.current = null;
    if (id) glassesService.cancel(id);
    setState(IDLE);
  }, []);

  // Withdraw an unfinished request when the dialog goes away.
  useEffect(() => () => {
    stopPolling();
    if (activeId.current) glassesService.cancel(activeId.current);
    activeId.current = null;
  }, []);

  return { state, start, cancel, busy: state.phase !== 'idle' && state.phase !== 'failed' };
}
