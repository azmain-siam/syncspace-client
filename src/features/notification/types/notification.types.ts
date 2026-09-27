export enum NotificationType {
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  TASK_MENTION = 'TASK_MENTION',
  TASK_DUE = 'TASK_DUE',
  WORKSPACE_INVITATION = 'WORKSPACE_INVITATION',
  PROJECT_INVITATION = 'PROJECT_INVITATION',
}

export interface UserMinimal {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}

export interface Notification {
  id: string;
  userId: string;
  actorId: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
  actor: UserMinimal;
}

export interface NotificationPaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  unreadCount: number;
}

export interface PaginatedNotificationsResponse {
  notifications: Notification[];
  meta: NotificationPaginationMeta;
}

export interface NotificationQueryParams {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}
