// SyncSpace Global Domain & API Interfaces

export type WorkspaceRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export const WorkspaceRole = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
} as const;

export type WorkspaceVisibility = 'PRIVATE' | 'PUBLIC';

export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'ARCHIVED';
export const ProjectStatus = {
  PLANNING: 'PLANNING',
  ACTIVE: 'ACTIVE',
  ON_HOLD: 'ON_HOLD',
  COMPLETED: 'COMPLETED',
  ARCHIVED: 'ARCHIVED',
} as const;

export type ProjectPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export const ProjectPriority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const;

export type ProjectMemberRole = 'MANAGER' | 'LEAD' | 'MEMBER' | 'VIEWER';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';

export type LinkType =
  | 'FIGMA'
  | 'GITHUB'
  | 'GOOGLE_DOC'
  | 'NOTION'
  | 'SWAGGER'
  | 'LOOM'
  | 'WEBSITE'
  | 'OTHER';

export type NotificationType =
  | 'TASK_ASSIGNED'
  | 'TASK_MENTION'
  | 'TASK_DUE'
  | 'WORKSPACE_INVITATION'
  | 'PROJECT_INVITATION';

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  phone?: string | null;
  avatar?: string | null;
  provider: 'LOCAL' | 'GOOGLE';
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logo?: string | null;
  ownerId: string;
  visibility: WorkspaceVisibility;
  createdAt: string;
  updatedAt: string;
  owner?: User;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
  joinedAt: string;
  user: User;
}

export interface WorkspaceInvitation {
  id: string;
  workspaceId: string;
  email: string;
  role: WorkspaceRole;
  token: string;
  invitedById: string;
  expiresAt: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  workspace?: Workspace;
  invitedBy?: User;
}

export interface Project {
  id: string;
  workspaceId: string;
  title: string;
  slug?: string | null;
  description?: string | null;
  status: ProjectStatus;
  priority: ProjectPriority;
  createdById: string;
  startDate?: string | null;
  dueDate?: string | null;
  color?: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy?: User;
  boards?: Board[];
}

export interface Board {
  id: string;
  projectId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  columns?: BoardColumn[];
}

export interface BoardColumn {
  id: string;
  boardId: string;
  title: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  tasks?: Task[];
}

export interface Task {
  id: string;
  columnId: string;
  assigneeId?: string | null;
  createdBy: string;
  title: string;
  description?: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
  assignee?: User | null;
  creator?: User;
  commentsCount?: number;
  attachmentsCount?: number;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  isEdited: boolean;
  editedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  user: User;
}

export interface Attachment {
  id: string;
  taskId: string;
  fileName: string;
  fileUrl: string;
  storageProvider: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  createdAt: string;
  uploader?: User;
}

export interface TaskLink {
  id: string;
  taskId: string;
  createdById: string;
  title: string;
  url: string;
  type: LinkType;
  createdAt: string;
  updatedAt: string;
  createdBy?: User;
}

export interface Notification {
  id: string;
  userId: string;
  actorId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
  actor: User;
}

export interface WorkspaceActivity {
  id: string;
  workspaceId: string;
  projectId?: string | null;
  taskId?: string | null;
  boardId?: string | null;
  actorId: string;
  action: string;
  description?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  actor: User;
}

// Standard API Response Envelope
export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    hasMore?: boolean;
    nextCursor?: string;
  };
}
