const KEY = 'entryflow_venue_created_order';

/**
 * GET /venues returns no creation timestamp and no guaranteed ordering, so a newly-created
 * venue can land anywhere in the list. This records when a venue was created *from this app*
 * so the Venues page can float it to the top — same "cache what the backend doesn't give us"
 * pattern as lib/local-avatars.ts.
 */
function readMap(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}');
  } catch {
    return {};
  }
}

export function recordVenueCreated(id: string): void {
  if (typeof window === 'undefined' || !id) return;
  try {
    const map = readMap();
    map[id] = Date.now();
    localStorage.setItem(KEY, JSON.stringify(map));
  } catch {
    // storage full/unavailable — the venue just won't be pinned to the top locally
  }
}

/** Returns the local creation timestamp for `id`, or undefined if this venue wasn't created from this app/browser. */
export function getVenueCreatedRank(id: string): number | undefined {
  if (!id) return undefined;
  return readMap()[id];
}
