'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from '@/providers/socket-provider';
import { useAuthStore } from '@/features/auth/stores/use-auth-store';
import type { NotificationCreatedSocketPayload } from '../types/realtime.types';

/**
 * Hook to listen for direct user push notifications (user:<userId>) via Socket.IO
 * Displays rich Sonner toasts and tracks unread count in real time.
 */
export function useUserNotifications() {
  const { socket, isConnected } = useSocket();
  const currentUser = useAuthStore((s) => s.user);
  const router = useRouter();
  const queryClient = useQueryClient();

  const [unreadCount, setUnreadCount] = React.useState<number>(0);

  React.useEffect(() => {
    if (!socket || !isConnected || !currentUser) return;

    const handleNotification = (payload: NotificationCreatedSocketPayload) => {
      // Confirm the notification is destined for current user
      if (payload?.userId === currentUser.id || payload?.notification?.userId === currentUser.id) {
        setUnreadCount((prev) => prev + 1);
        queryClient.invalidateQueries({ queryKey: ['notifications'] });

        const { title, message, link } = payload.notification;

        toast(title, {
          description: message,
          action: link
            ? {
                label: 'View',
                onClick: () => router.push(link),
              }
            : undefined,
          duration: 6000,
        });
      }
    };

    socket.on('notification:created', handleNotification);

    return () => {
      socket.off('notification:created', handleNotification);
    };
  }, [socket, isConnected, currentUser, router, queryClient]);

  const markAllAsRead = React.useCallback(() => {
    setUnreadCount(0);
  }, []);

  return {
    unreadCount,
    markAllAsRead,
    clearUnread: () => setUnreadCount(0),
  };
}
