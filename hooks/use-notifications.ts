import { mockNotifications } from '@/constants/mock-data';
import { useNotificationStore } from '@/store';

export function useNotifications(_params?: { unreadOnly?: boolean; limit?: number }) {
  return { data: mockNotifications, isLoading: false, error: null };
}
