import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { popup } from '@/lib/popup';
import { notificationService } from "@/services/notification.service";
import { QUERY_KEYS } from "@/constants";

export const notificationKeys = {
  all:  QUERY_KEYS.NOTIFICATIONS,
  list: (params?: { limit?: number; read?: boolean }) =>
    [...QUERY_KEYS.NOTIFICATIONS, "list", params] as const,
};

export function useNotifications(params?: { limit?: number; read?: boolean }) {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn:  () => notificationService.getNotifications({ read: params?.read }),
    refetchInterval: 30000,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationService.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: notificationKeys.all }),
    onError:   () => popup.error("Failed to mark as read"),
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notificationService.markAllRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.all });
      popup.success("All notifications marked as read");
    },
    onError: () => popup.error("Failed to mark all as read"),
  });
}

export function useDeleteAllNotifications() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notificationService.deleteAll,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.all });
      popup.success("Inbox cleared");
    },
    onError: () => popup.error("Failed to clear notifications"),
  });
}
