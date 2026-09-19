import type { UserMinimal } from '@/features/task/types/task.types';

export enum RoomType {
  WORKSPACE = 'workspace', // Room name: `workspace:<workspaceId>`
  BOARD = 'board',         // Room name: `board:<boardId>`
  TASK = 'task',           // Room name: `task:<taskId>`
}

// Client-to-Server Inbound Payload Types
export interface RoomJoinPayload {
  roomType: RoomType | 'workspace' | 'board' | 'task';
  targetId: string;
}

export interface RoomLeavePayload {
  roomType: RoomType | 'workspace' | 'board' | 'task';
  targetId: string;
}

export interface PresenceGetOnlinePayload {
  workspaceId: string;
}

// Server-to-Client Outbound Payload Types

// Presence
export interface UserOnlinePayload {
  userId: string;
  user?: {
    id: string;
    name: string;
    avatar?: string | null;
  };
}

export interface UserOfflinePayload {
  userId: string;
}

export interface PresenceOnlineUsersPayload {
  workspaceId: string;
  onlineUserIds: string[];
}

// Board & Task
export interface TaskCreatedSocketPayload {
  task: {
    id: string;
    columnId: string;
    key?: string | null;
    title: string;
    priority: string;
    status: string;
    order: number;
    assignee?: UserMinimal | null;
    labels?: Array<{ id: string; name: string; color: string }>;
  };
  boardId: string;
  workspaceId: string;
}

export interface TaskMovedSocketPayload {
  taskId: string;
  sourceColumnId: string;
  destinationColumnId: string;
  newOrder: number;
  boardId: string;
  workspaceId: string;
}

export interface TaskUpdatedSocketPayload {
  task: {
    id: string;
    title?: string;
    priority?: string;
    status?: string;
    description?: string | null;
    assigneeId?: string | null;
    dueDate?: string | null;
    [key: string]: unknown;
  };
  boardId?: string;
  taskId?: string;
  workspaceId?: string;
}

export interface TaskDeletedSocketPayload {
  taskId: string;
  boardId?: string;
  workspaceId?: string;
}

// Comments & Reactions
export interface CommentSocketUser {
  id: string;
  name: string;
  avatar?: string | null;
}

export interface CommentCreatedSocketPayload {
  comment: {
    id: string;
    taskId: string;
    content: string;
    user: CommentSocketUser;
    reactions?: unknown[];
    createdAt: string;
  };
  taskId: string;
}

export interface CommentUpdatedSocketPayload {
  comment: {
    id: string;
    content: string;
    isEdited: boolean;
    editedAt?: string | null;
  };
  taskId: string;
}

export interface CommentDeletedSocketPayload {
  commentId: string;
  taskId: string;
}

export interface CommentReactionSocketPayload {
  commentId: string;
  taskId: string;
  action: 'added' | 'removed';
  emoji: string;
  actorId: string;
  actorName: string;
  reactions: Array<{
    emoji: string;
    count: number;
    hasReacted: boolean;
    users: Array<{ id: string; name: string; avatar?: string | null }>;
  }>;
}

// Push Notifications
export interface NotificationCreatedSocketPayload {
  notification: {
    id: string;
    userId: string;
    actorId: string;
    type: string;
    title: string;
    message: string;
    link?: string | null;
    isRead: boolean;
    createdAt: string;
    actor?: {
      id: string;
      name: string;
      avatar?: string | null;
    };
  };
  userId: string;
}
