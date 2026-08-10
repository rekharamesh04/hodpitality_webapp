import { useState, useEffect, useCallback } from 'react';
import { mockApiService } from '@/services/mockApi';
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
      const response = await mockApiService.getGuests(filters);
      
      if (response.success && response.data) {
        setGuests(response.data.data);
        setPagination({
          page: response.data.page,
          pageSize: response.data.pageSize,
          total: response.data.total,
          totalPages: response.data.totalPages,
        });
      } else {
        setError(response.error || 'Failed to fetch guests');
      }
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
      const response = await mockApiService.createGuest(guestData);
      
      if (response.success) {
        await fetchGuests(initialFilters);
        return { success: true, data: response.data };
      } else {
        setError(response.error || 'Failed to create guest');
        return { success: false, error: response.error };
      }
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
      const response = await mockApiService.updateGuest(id, updates);
      
      if (response.success) {
        await fetchGuests(initialFilters);
        return { success: true, data: response.data };
      } else {
        setError(response.error || 'Failed to update guest');
        return { success: false, error: response.error };
      }
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
      const response = await mockApiService.deleteGuest(id);
      
      if (response.success) {
        await fetchGuests(initialFilters);
        return { success: true };
      } else {
        setError(response.error || 'Failed to delete guest');
        return { success: false, error: response.error };
      }
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