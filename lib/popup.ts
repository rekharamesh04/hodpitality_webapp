'use client';

import type { ReactNode } from 'react';
import { usePopupStore } from '@/store/popup-store';
import type { PopupOptions, PopupVariant } from '@/store/popup-store';

export type { PopupOptions, PopupVariant } from '@/store/popup-store';

/**
 * Application-wide popup messages.
 *
 * Every success / failure notice in the app goes through here and is rendered as a modal
 * dialog by `<PopupHost />` (mounted once in `providers/index.tsx`), so a message is never
 * missed the way a toast that fades after four seconds can be.
 *
 * The call signature matches what the app used before, so `popup.error('Boom')` and
 * `popup.success('Saved', { description: '…' })` read the same at every call site.
 * Safe to call from anywhere on the client — hooks, event handlers, service functions.
 */
function show(variant: PopupVariant, title: ReactNode, options?: PopupOptions): string {
  return usePopupStore.getState().push({ ...options, variant, title });
}

export const popup = {
  success: (title: ReactNode, options?: PopupOptions) => show('success', title, options),
  error:   (title: ReactNode, options?: PopupOptions) => show('error',   title, options),
  warning: (title: ReactNode, options?: PopupOptions) => show('warning', title, options),
  info:    (title: ReactNode, options?: PopupOptions) => show('info',    title, options),

  /** Same as `popup.info` — for messages that carry no success/failure meaning. */
  message: (title: ReactNode, options?: PopupOptions) => show('info', title, options),

  /** Close a popup by id, or the one on screen when no id is given. */
  dismiss: (id?: string) => usePopupStore.getState().dismiss(id),

  /** Drop everything queued, including what is on screen. */
  clear: () => usePopupStore.getState().clear(),
};
