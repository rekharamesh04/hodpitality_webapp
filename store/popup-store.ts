import { create } from 'zustand';
import type { ReactNode } from 'react';

export type PopupVariant = 'success' | 'error' | 'warning' | 'info';

export interface PopupOptions {
  /** Secondary line under the title. */
  description?: ReactNode;
  /**
   * Stable id. Pushing again with the same id replaces that popup in place instead of
   * queueing a second one behind it — use it for multi-step flows that report progress.
   */
  id?: string;
  /** Auto-dismiss after this many ms. Omit (or 0) to keep it open until the user closes it. */
  duration?: number;
  /** Run when the popup leaves the screen, however it was dismissed. */
  onDismiss?: () => void;
}

export interface PopupItem extends Omit<PopupOptions, 'id'> {
  id: string;
  variant: PopupVariant;
  title: ReactNode;
}

/**
 * Popups are modal, so more than a handful queued up would trap the user behind a stack of
 * dialogs. Anything past the cap is dropped — in practice the de-duplication below keeps a
 * burst of identical failures (a bulk action, a retried mutation) down to a single entry.
 */
const MAX_QUEUED = 5;

let autoId = 0;

/** Two popups count as the same message only when both titles/descriptions are plain text. */
function isSameMessage(a: PopupItem, b: PopupItem): boolean {
  if (a.variant !== b.variant) return false;
  if (typeof a.title !== 'string' || typeof b.title !== 'string' || a.title !== b.title) return false;
  const aDesc = typeof a.description === 'string' ? a.description : undefined;
  const bDesc = typeof b.description === 'string' ? b.description : undefined;
  if (typeof a.description !== 'string' && a.description != null) return false;
  if (typeof b.description !== 'string' && b.description != null) return false;
  return aDesc === bDesc;
}

interface PopupState {
  /** Head of the queue is the one on screen; the rest follow as it is dismissed. */
  queue: PopupItem[];
  push: (input: Omit<PopupItem, 'id'> & { id?: string }) => string;
  /** Dismiss a specific popup, or the one currently on screen when no id is given. */
  dismiss: (id?: string) => void;
  clear: () => void;
}

export const usePopupStore = create<PopupState>((set, get) => ({
  queue: [],

  push: (input) => {
    const id = input.id ?? `popup-${++autoId}`;
    const item: PopupItem = { ...input, id };

    set((state) => {
      const existing = state.queue.findIndex((p) => p.id === id);
      if (existing !== -1) {
        const queue = state.queue.slice();
        queue[existing] = item;
        return { queue };
      }
      if (state.queue.some((p) => isSameMessage(p, item))) return state;
      if (state.queue.length >= MAX_QUEUED) return state;
      return { queue: [...state.queue, item] };
    });

    return id;
  },

  dismiss: (id) => {
    const target = id ?? get().queue[0]?.id;
    if (!target) return;
    const item = get().queue.find((p) => p.id === target);
    set((state) => ({ queue: state.queue.filter((p) => p.id !== target) }));
    item?.onDismiss?.();
  },

  clear: () => {
    const { queue } = get();
    set({ queue: [] });
    queue.forEach((p) => p.onDismiss?.());
  },
}));
