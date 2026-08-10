/**
 * Service Integration Point
 * 
 * This file allows you to easily switch between mock data and real API
 * by changing a single configuration flag.
 */

import { mockApiService } from './mockApi';
import { apiService } from './api';

// Configuration flag - set to true to use real API
const USE_REAL_API = false;

/**
 * Main service instance
 * Switch between mock and real API here
 */
export const hospitalityService = USE_REAL_API ? apiService : mockApiService;

/**
 * Export workflow service (works with both mock and real API)
 */
export { workflowService } from './workflowService';

/**
 * Export types for consumers
 */
export type * from '@/types';

/**
 * Configuration
 */
export const config = {
  useRealApi: USE_REAL_API,
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  mockDelay: 500, // ms delay for mock API to simulate network
};

/**
 * Usage Examples:
 * 
 * // In your components or hooks:
 * import { hospitalityService, workflowService } from '@/services';
 * 
 * // Basic CRUD operations
 * const guests = await hospitalityService.getGuests();
 * const newGuest = await hospitalityService.createGuest(guestData);
 * 
 * // Business workflows
 * const result = await workflowService.completeRegistration(registrationData);
 * const checkIn = await workflowService.processCheckIn(checkInData);
 */