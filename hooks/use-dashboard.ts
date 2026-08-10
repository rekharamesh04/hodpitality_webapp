import { mockDashboardStats, mockActivityFeed, mockEvents } from '@/constants/mock-data';

export function useDashboardStats() {
  return { data: mockDashboardStats, isLoading: false, error: null };
}

export function useActivityFeed(_limit?: number) {
  return { data: mockActivityFeed, isLoading: false, error: null };
}

export function useUpcomingEvents() {
  return { data: mockEvents, isLoading: false, error: null };
}
