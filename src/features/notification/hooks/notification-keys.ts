import type { NotificationQueryParams } from '../types/notification.types';

export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (params?: NotificationQueryParams) =>
    [...notificationKeys.lists(), params] as const,
};
