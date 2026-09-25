import { afterEach, describe, expect, it, vi } from 'vitest';
import { HANDOFF_TTL_MS, usePickupHandoffStore } from './pickup-handoff-store';

const store = () => usePickupHandoffStore.getState();

describe('the check-in to counter handoff', () => {
  afterEach(() => {
    vi.useRealTimers();
    usePickupHandoffStore.setState({ handoff: null });
  });

  it('carries a face match to the same patient, once', () => {
    store().give('g1', 'Face matched at check-in (96.8%)');
    expect(store().take('g1')?.detail).toBe('Face matched at check-in (96.8%)');
    expect(store().take('g1')).toBeNull();
  });

  it('never verifies a different patient', () => {
    store().give('g1', 'face');
    expect(store().take('g2')).toBeNull();
    // Nor is it left lying around for the right one afterwards.
    expect(store().take('g1')).toBeNull();
  });

  it('lapses, so an old match cannot verify a later visit', () => {
    vi.useFakeTimers();
    store().give('g1', 'face');
    vi.advanceTimersByTime(HANDOFF_TTL_MS + 1);
    expect(store().take('g1')).toBeNull();
  });
});
