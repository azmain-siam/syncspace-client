'use client';

import { useNotificationListener } from '../hooks/use-notification-listener';

/**
 * Global component mounted inside providers to listen for incoming real-time notifications
 * and dispatch instant toast alerts.
 */
export function NotificationToastListener() {
  useNotificationListener();
  return null;
}
