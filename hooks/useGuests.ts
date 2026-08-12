import { useState, useEffect, useCallback } from 'react';
import { guestService } from '@/services/guest.service';
import type { Guest, TableFilters } from '@/types';

export function useGuests(initialFilters?: TableFilters) {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchGuests = useCallback(async (filters?: TableFilters) => {
    setLoading(true);
    setError(null);
    try {
      const response = await guestService.getGuests(filters);
      setGuests(response.data);
      setPagination({ page: 1, pageSize: 10, total: response.data.length, totalPages: 1 });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const createGuest = useCallback(async (guestData: Omit<Guest, 'id'>) => {
    setLoading(true);
    setError(null);
    try {
      const guest = await guestService.createGuest(guestData);
      await fetchGuests(initialFilters);
      return { success: true, data: guest };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [fetchGuests, initialFilters]);

  const updateGuest = useCallback(async (id: string, updates: Partial<Guest>) => {
    setLoading(true);
    setError(null);
    try {
      const guest = await guestService.updateGuest(id, updates);
      await fetchGuests(initialFilters);
      return { success: true, data: guest };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [fetchGuests, initialFilters]);

  const deleteGuest = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await guestService.deleteGuest(id);
      await fetchGuests(initialFilters);
      return { success: true };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [fetchGuests, initialFilters]);

  useEffect(() => {
    fetchGuests(initialFilters);
  }, [fetchGuests, initialFilters]);

  return {
    guests,
    loading,
    error,
    pagination,
    fetchGuests,
    createGuest,
    updateGuest,
    deleteGuest,
  };
}