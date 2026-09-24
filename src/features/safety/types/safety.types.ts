export enum TrashItemType {
  TASK = 'TASK',
  PROJECT = 'PROJECT',
}

export enum ActivityAction {
  WORKSPACE_CREATED = 'WORKSPACE_CREATED',
  WORKSPACE_UPDATED = 'WORKSPACE_UPDATED',
  WORKSPACE_DELETED = 'WORKSPACE_DELETED',
  MEMBER_INVITED = 'MEMBER_INVITED',
  MEMBER_REMOVED = 'MEMBER_REMOVED',
  MEMBER_LEFT = 'MEMBER_LEFT',
  ROLE_UPDATED = 'ROLE_UPDATED',
  SETTINGS_UPDATED = 'SETTINGS_UPDATED',
  INVITATION_SENT = 'INVITATION_SENT',
  INVITATION_ACCEPTED = 'INVITATION_ACCEPTED',
  INVITATION_DECLINED = 'INVITATION_DECLINED',
  INVITATION_CANCELLED = 'INVITATION_CANCELLED',
  PROJECT_CREATED = 'PROJECT_CREATED',
  PROJECT_UPDATED = 'PROJECT_UPDATED',
  PROJECT_ARCHIVED = 'PROJECT_ARCHIVED',
  PROJECT_RESTORED = 'PROJECT_RESTORED',
  PROJECT_DELETED = 'PROJECT_DELETED',
  BOARD_CREATED = 'BOARD_CREATED',
  BOARD_UPDATED = 'BOARD_UPDATED',
  BOARD_DELETED = 'BOARD_DELETED',
  COLUMN_CREATED = 'COLUMN_CREATED',
  COLUMN_UPDATED = 'COLUMN_UPDATED',
  COLUMN_DELETED = 'COLUMN_DELETED',
  COLUMN_REORDERED = 'COLUMN_REORDERED',
  TASK_CREATED = 'TASK_CREATED',
  TASK_UPDATED = 'TASK_UPDATED',
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  TASK_MOVED = 'TASK_MOVED',
  TASK_DELETED = 'TASK_DELETED',
  TASK_RESTORED = 'TASK_RESTORED',
  COMMENT_CREATED = 'COMMENT_CREATED',
  COMMENT_UPDATED = 'COMMENT_UPDATED',
  COMMENT_DELETED = 'COMMENT_DELETED',
  COMMENT_REACTION_ADDED = 'COMMENT_REACTION_ADDED',
  COMMENT_REACTION_REMOVED = 'COMMENT_REACTION_REMOVED',
  ATTACHMENT_UPLOADED = 'ATTACHMENT_UPLOADED',
  ATTACHMENT_DELETED = 'ATTACHMENT_DELETED',
  TASK_LINK_CREATED = 'TASK_LINK_CREATED',
  TASK_LINK_UPDATED = 'TASK_LINK_UPDATED',
  TASK_LINK_DELETED = 'TASK_LINK_DELETED',
  CHECKLIST_ITEM_CREATED = 'CHECKLIST_ITEM_CREATED',
  CHECKLIST_ITEM_TOGGLED = 'CHECKLIST_ITEM_TOGGLED',
  CHECKLIST_ITEM_UPDATED = 'CHECKLIST_ITEM_UPDATED',
  CHECKLIST_ITEM_DELETED = 'CHECKLIST_ITEM_DELETED',
  LABEL_CREATED = 'LABEL_CREATED',
  LABEL_UPDATED = 'LABEL_UPDATED',
  LABEL_DELETED = 'LABEL_DELETED',
  LABEL_ATTACHED = 'LABEL_ATTACHED',
  LABEL_DETACHED = 'LABEL_DETACHED',
  SPRINT_CREATED = 'SPRINT_CREATED',
  SPRINT_UPDATED = 'SPRINT_UPDATED',
  SPRINT_STARTED = 'SPRINT_STARTED',
  SPRINT_COMPLETED = 'SPRINT_COMPLETED',
  SPRINT_DELETED = 'SPRINT_DELETED',
  TASK_MOVED_TO_SPRINT = 'TASK_MOVED_TO_SPRINT',
  TASKS_BULK_UPDATED = 'TASKS_BULK_UPDATED',
  TASKS_BULK_DELETED = 'TASKS_BULK_DELETED',
}

export enum AuditAction {
  USER_REGISTERED = 'USER_REGISTERED',
  EMAIL_VERIFICATION_SENT = 'EMAIL_VERIFICATION_SENT',
  EMAIL_VERIFIED = 'EMAIL_VERIFIED',
  VERIFICATION_EMAIL_RESENT = 'VERIFICATION_EMAIL_RESENT',
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  FAILED_LOGIN = 'FAILED_LOGIN',
  PASSWORD_RESET_REQUESTED = 'PASSWORD_RESET_REQUESTED',
  PASSWORD_RESET_COMPLETED = 'PASSWORD_RESET_COMPLETED',
  WORKSPACE_INVITATION_CREATED = 'WORKSPACE_INVITATION_CREATED',
  WORKSPACE_INVITATION_ACCEPTED = 'WORKSPACE_INVITATION_ACCEPTED',
  WORKSPACE_INVITATION_DECLINED = 'WORKSPACE_INVITATION_DECLINED',
  WORKSPACE_INVITATION_CANCELLED = 'WORKSPACE_INVITATION_CANCELLED',
  WORKSPACE_DELETED = 'WORKSPACE_DELETED',
  WORKSPACE_LEFT = 'WORKSPACE_LEFT',
  GOOGLE_LOGIN = 'GOOGLE_LOGIN',
  GOOGLE_ACCOUNT_CREATED = 'GOOGLE_ACCOUNT_CREATED',
  GOOGLE_ACCOUNT_LINKED = 'GOOGLE_ACCOUNT_LINKED',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  TRASH_ITEM_RESTORED = 'TRASH_ITEM_RESTORED',
  TRASH_EMPTIED = 'TRASH_EMPTIED',
}

export interface UserMinimal {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}

export interface TaskContainerInfo {
  projectId: string;
  projectName: string;
  projectKey: string | null;
  projectDeleted: boolean;
  boardId: string;
  boardName: string;
  columnId: string;
  columnName: string;
}

export interface TrashItem {
  id: string;
  itemType: 'TASK' | 'PROJECT';
  title: string;
  key: string | null;
  slug?: string | null;
  deletedAt: string;
  deletedBy: UserMinimal;
  container: TaskContainerInfo | null;
}

export interface WorkspaceActivity {
  id: string;
  workspaceId: string;
  projectId: string | null;
  taskId: string | null;
  boardId: string | null;
  actorId: string;
  action: ActivityAction;
  description: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  actor: UserMinimal;
  project?: {
    id: string;
    title: string;
  } | null;
}

export interface AuditLog {
  id: string;
  workspaceId: string | null;
  actorId: string | null;
  action: AuditAction;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  actor: UserMinimal | null;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedTrashResponse {
  items: TrashItem[];
  meta: PaginationMeta;
}

export interface PaginatedActivitiesResponse {
  activities: WorkspaceActivity[];
  meta: PaginationMeta;
}

export interface PaginatedAuditLogsResponse {
  auditLogs: AuditLog[];
  meta: PaginationMeta;
}

export interface TrashQueryParams {
  type?: 'ALL' | 'TASK' | 'PROJECT';
  page?: number;
  limit?: number;
  search?: string;
}

export interface RestoreTrashItemPayload {
  itemType: 'TASK' | 'PROJECT';
  itemId: string;
}

export interface RestoreTrashResponse {
  success: boolean;
  message: string;
  item?: {
    id: string;
    deletedAt: string | null;
  };
}

export interface EmptyTrashQueryParams {
  itemId?: string;
  itemType?: 'TASK' | 'PROJECT';
}

export interface EmptyTrashResponse {
  success: boolean;
  message: string;
}

export interface WorkspaceActivitiesQueryParams {
  page?: number;
  limit?: number;
}

export interface TaskActivitiesQueryParams {
  page?: number;
  limit?: number;
}

export interface WorkspaceAuditLogsQueryParams {
  page?: number;
  limit?: number;
  actorId?: string;
  action?: AuditAction;
  startDate?: string;
  endDate?: string;
}
