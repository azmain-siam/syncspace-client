'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from '@/providers/socket-provider';
import { useAuthStore } from '@/features/auth/stores/use-auth-store';
import { notificationKeys } from './notification-keys';
import type { Notification } from '../types/notification.types';

export interface NotificationSocketEventPayload {
  notification: Notification;
  userId?: string;
}

/**
 * Real-time WebSocket notification listener hook.
 * Listens on the user's private socket room for `notification:created` events,
 * invalidates React Query notification caches, and triggers actionable Sonner toasts.
 */
export function useNotificationListener() {
  const { socket, isConnected } = useSocket();
  const currentUser = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const router = useRouter();

  React.useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNotificationCreated = (payload: NotificationSocketEventPayload) => {
      // Defensive check: ensure event target matches current user if provided
      if (
        payload?.userId &&
        currentUser?.id &&
        payload.userId !== currentUser.id
      ) {
        return;
      }

      const notif = payload?.notification;
      if (!notif) return;

      // 1. Invalidate notifications queries to update unread badge and list feeds
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });

      // 2. Display actionable Sonner toast notification
      toast(notif.title, {
        description: notif.message,
        action: notif.link
          ? {
              label: 'View',
              onClick: () => {
                const dest = notif.link!.startsWith('/') ? notif.link! : `/${notif.link!}`;
                router.push(dest);
              },
            }
          : undefined,
        duration: 6000,
      });
    };

    socket.on('notification:created', handleNotificationCreated);

    return () => {
      socket.off('notification:created', handleNotificationCreated);
    };
  }, [socket, isConnected, currentUser?.id, queryClient, router]);
}
