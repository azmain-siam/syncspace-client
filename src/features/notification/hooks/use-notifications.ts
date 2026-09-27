'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { notificationApi } from '../api/notification.api';
import { notificationKeys } from './notification-keys';
import type {
  PaginatedNotificationsResponse,
  NotificationQueryParams,
} from '../types/notification.types';

/**
 * Hook to query notifications with unreadCount and pagination
 */
export function useNotifications(params?: NotificationQueryParams) {
  return useQuery<PaginatedNotificationsResponse>({
    queryKey: notificationKeys.list(params),
    queryFn: async () => {
      const response = await notificationApi.getNotifications(params);
      return response.data;
    },
    staleTime: 30 * 1000,
  });
}

/**
 * Optimistic mutation to mark a single notification as read
 */
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await notificationApi.markAsRead(id);
      return response.data;
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all });

      const previousQueries = queryClient.getQueriesData<PaginatedNotificationsResponse>({
        queryKey: notificationKeys.all,
      });

      queryClient.setQueriesData<PaginatedNotificationsResponse>(
        { queryKey: notificationKeys.all },
        (old) => {
          if (!old) return old;
          const target = old.notifications.find((n) => n.id === id);
          const wasUnread = target ? !target.isRead : false;

          return {
            ...old,
            notifications: old.notifications.map((n) =>
              n.id === id ? { ...n, isRead: true } : n,
            ),
            meta: {
              ...old.meta,
              unreadCount: wasUnread
                ? Math.max(0, old.meta.unreadCount - 1)
                : old.meta.unreadCount,
            },
          };
        },
      );

      return { previousQueries };
    },
    onError: (_err, _id, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error('Failed to mark notification as read');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

/**
 * Optimistic mutation to mark all notifications as read
 */
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await notificationApi.markAllAsRead();
      return response.data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all });

      const previousQueries = queryClient.getQueriesData<PaginatedNotificationsResponse>({
        queryKey: notificationKeys.all,
      });

      queryClient.setQueriesData<PaginatedNotificationsResponse>(
        { queryKey: notificationKeys.all },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            notifications: old.notifications.map((n) => ({
              ...n,
              isRead: true,
            })),
            meta: {
              ...old.meta,
              unreadCount: 0,
            },
          };
        },
      );

      return { previousQueries };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error('Failed to mark all notifications as read');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

/**
 * Optimistic mutation to delete a notification
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await notificationApi.deleteNotification(id);
      return response.data;
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all });

      const previousQueries = queryClient.getQueriesData<PaginatedNotificationsResponse>({
        queryKey: notificationKeys.all,
      });

      queryClient.setQueriesData<PaginatedNotificationsResponse>(
        { queryKey: notificationKeys.all },
        (old) => {
          if (!old) return old;
          const target = old.notifications.find((n) => n.id === id);
          const wasUnread = target ? !target.isRead : false;

          return {
            ...old,
            notifications: old.notifications.filter((n) => n.id !== id),
            meta: {
              ...old.meta,
              total: Math.max(0, old.meta.total - 1),
              unreadCount: wasUnread
                ? Math.max(0, old.meta.unreadCount - 1)
                : old.meta.unreadCount,
            },
          };
        },
      );

      return { previousQueries };
    },
    onError: (_err, _id, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error('Failed to delete notification');
    },
    onSuccess: () => {
      toast.success('Notification deleted');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}
