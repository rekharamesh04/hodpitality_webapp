import { useState, useCallback } from 'react';
import { workflowService, type FullRegistrationData, type CheckInWorkflowData } from '@/services/workflowService';

export function useWorkflow() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Complete Registration Workflow
  const completeRegistration = useCallback(async (data: FullRegistrationData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await workflowService.completeRegistration(data);
      
      if (!result.success) {
        setError(result.error || 'Registration failed');
      }
      
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Check-in Workflow
  const processCheckIn = useCallback(async (data: CheckInWorkflowData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await workflowService.processCheckIn(data);
      
      if (!result.success) {
        setError(result.error || 'Check-in failed');
      }
      
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Create Event with Venue
  const createEventWithVenue = useCallback(async (eventData: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await workflowService.createEventWithVenue(eventData);
      
      if (!result.success) {
        setError(result.error || 'Event creation failed');
      }
      
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Bulk Check-in
  const bulkCheckIn = useCallback(async (guestIds: string[], venue: string, method: 'QR' | 'Manual' = 'Manual') => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await workflowService.bulkCheckIn(guestIds, venue, method);
      
      if (!result.success) {
        setError(result.error || 'Bulk check-in failed');
      }
      
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Create Hospitality Package
  const createHospitalityPackage = useCallback(async (
    guestId: string,
    packageType: 'standard' | 'vip' | 'speaker' | 'custom',
    customServices?: any[]
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await workflowService.createHospitalityPackage(guestId, packageType, customServices);
      
      if (!result.success) {
        setError(result.error || 'Hospitality package creation failed');
      }
      
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get Guest Journey
  const getGuestJourney = useCallback(async (guestId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await workflowService.getGuestJourney(guestId);
      
      if (!result.success) {
        setError(result.error || 'Failed to fetch guest journey');
      }
      
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Generate Event Report
  const generateEventReport = useCallback(async (eventId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await workflowService.generateEventReport(eventId);
      
      if (!result.success) {
        setError(result.error || 'Failed to generate report');
      }
      
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    completeRegistration,
    processCheckIn,
    createEventWithVenue,
    bulkCheckIn,
    createHospitalityPackage,
    getGuestJourney,
    generateEventReport,
  };
}