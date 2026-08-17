import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
    queryFn:  () => notificationService.getNotifications(params),
    refetchInterval: 30000,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationService.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: notificationKeys.all }),
    onError:   () => toast.error("Failed to mark as read"),
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notificationService.markAllRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.all });
      toast.success("All notifications marked as read");
    },
    onError: () => toast.error("Failed to mark all as read"),
  });
}

export function useDeleteAllNotifications() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notificationService.deleteAll,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.all });
      toast.success("Inbox cleared");
    },
    onError: () => toast.error("Failed to clear notifications"),
  });
}
