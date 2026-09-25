import { create } from 'zustand';

/**
 * A face match made at check-in, handed to the collection counter.
 *
 * A patient whose face was just matched at check-in should not be asked to
 * scan again a minute later at the counter. This carries that match across —
 * in memory only, never the URL or storage, so it cannot be typed into an
 * address bar or survive a reload, and it lapses after HANDOFF_TTL_MS.
 */
export const HANDOFF_TTL_MS = 5 * 60 * 1000;

export interface PickupHandoff {
  guestId: string;
  /** How identity was proven, recorded on the verification trail. */
  detail: string;
  at: number;
}

interface PickupHandoffState {
  handoff: PickupHandoff | null;
  give: (guestId: string, detail: string) => void;
  /** Returns the handoff for this patient if still fresh, and clears it. */
  take: (guestId: string) => PickupHandoff | null;
}

export const usePickupHandoffStore = create<PickupHandoffState>()((set, get) => ({
  handoff: null,
  give: (guestId, detail) => set({ handoff: { guestId, detail, at: Date.now() } }),
  take: (guestId) => {
    const h = get().handoff;
    set({ handoff: null });
    if (!h || h.guestId !== guestId || Date.now() - h.at > HANDOFF_TTL_MS) return null;
    return h;
  },
}));
