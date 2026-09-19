'use client';

import {
  useNotifications,
  useMarkAllNotificationsAsRead,
} from '@/features/notification';

/**
 * Convenience hook for reading live unread notification count and triggering bulk mark-as-read.
 * Backed directly by TanStack Query cache from `@/features/notification`.
 */
export function useUserNotifications() {
  const { data } = useNotifications({ page: 1, limit: 1 });
  const markAllMutation = useMarkAllNotificationsAsRead();

  return {
    unreadCount: data?.meta?.unreadCount ?? 0,
    markAllAsRead: () => markAllMutation.mutate(),
    clearUnread: () => markAllMutation.mutate(),
  };
}
