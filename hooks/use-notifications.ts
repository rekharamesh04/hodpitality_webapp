import { useQuery, useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query";
import type { Notification } from "@/types";
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
    // Keyed only by what is sent. `limit` never reaches the API (callers slice what they show),
    // so keying on it made the header, the dashboard panel and the inbox each poll the same list.
    queryKey: notificationKeys.list({ read: params?.read }),
    queryFn:  () => notificationService.getNotifications({ read: params?.read }),
    refetchInterval: 30000,
  });
}

type NotificationLists = [readonly unknown[], Notification[] | undefined][];

/**
 * Change every cached notification list at once, and return what they held so a failure can put
 * it back. The inbox, the sidebar's unread count and the dashboard panel all read these lists, so
 * all three change the moment the user acts rather than after the next poll.
 */
async function updateLists(
  qc: QueryClient,
  change: (list: Notification[]) => Notification[],
): Promise<NotificationLists> {
  await qc.cancelQueries({ queryKey: notificationKeys.all });
  const before = qc.getQueriesData<Notification[]>({ queryKey: notificationKeys.all });
  qc.setQueriesData<Notification[]>({ queryKey: notificationKeys.all }, (list) => (Array.isArray(list) ? change(list) : list));
  return before;
}

function restoreLists(qc: QueryClient, before?: NotificationLists) {
  for (const [key, list] of before ?? []) qc.setQueryData(key, list);
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationService.markRead(id),
    onMutate: (id) => updateLists(qc, (list) => list.map((n) => (n.id === id ? { ...n, read: true } : n))),
    onError: (_err, _id, before) => {
      restoreLists(qc, before);
      popup.error("Failed to mark as read");
    },
    onSettled: () => qc.invalidateQueries({ queryKey: notificationKeys.all }),
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notificationService.markAllRead,
    onMutate: () => updateLists(qc, (list) => list.map((n) => ({ ...n, read: true }))),
    onSuccess: () => popup.success("All notifications marked as read"),
    onError: (_err, _vars, before) => {
      restoreLists(qc, before);
      popup.error("Failed to mark all as read");
    },
    onSettled: () => qc.invalidateQueries({ queryKey: notificationKeys.all }),
  });
}

/**
 * Clear the inbox. The lists empty at once — before, the cleared notifications stayed on screen
 * until the refetch, and for a super admin they came straight back because the server cleared a
 * different set from the one listed (fixed there too: one set is listed, marked and cleared).
 */
export function useDeleteAllNotifications() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notificationService.deleteAll,
    onMutate: () => updateLists(qc, () => []),
    onSuccess: () => popup.success("Inbox cleared"),
    onError: (_err, _vars, before) => {
      restoreLists(qc, before);
      popup.error("Failed to clear notifications");
    },
    onSettled: () => qc.invalidateQueries({ queryKey: notificationKeys.all }),
  });
}
