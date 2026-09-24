import { apiClient } from '@/lib/api/api-client';
import type { ApiResponse } from '@/types/domain';
import type {
  PaginatedNotificationsResponse,
  NotificationQueryParams,
} from '../types/notification.types';

export interface MarkAsReadResponse {
  id: string;
  userId: string;
  isRead: boolean;
}

export interface MarkAllAsReadResponse {
  message: string;
}

export const notificationApi = {
  // 1. Get user notifications with unreadCount and pagination
  getNotifications: async (
    params?: NotificationQueryParams,
  ): Promise<ApiResponse<PaginatedNotificationsResponse>> => {
    const response = await apiClient.get<
      ApiResponse<PaginatedNotificationsResponse>
    >('/notifications', { params });
    return response.data;
  },

  // 2. Mark single notification as read
  markAsRead: async (
    id: string,
  ): Promise<ApiResponse<MarkAsReadResponse>> => {
    const response = await apiClient.patch<ApiResponse<MarkAsReadResponse>>(
      `/notifications/${id}/read`,
      {},
    );
    return response.data;
  },

  // 3. Batch mark all notifications as read
  markAllAsRead: async (): Promise<ApiResponse<MarkAllAsReadResponse>> => {
    const response = await apiClient.patch<ApiResponse<MarkAllAsReadResponse>>(
      '/notifications/read-all',
      {},
    );
    return response.data;
  },

  // 4. Delete notification permanently
  deleteNotification: async (
    id: string,
  ): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/notifications/${id}`,
    );
    return response.data;
  },
};
