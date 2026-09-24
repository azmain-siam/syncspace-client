import type { TaskPriority, TaskStatus, LinkType } from '@/types/domain';

export type { TaskPriority, TaskStatus, LinkType };

export interface UserMinimal {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
}

export interface TaskLabel {
  id: string;
  workspaceId: string;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskChecklistItem {
  id: string;
  taskId: string;
  title: string;
  isCompleted: boolean;
  order: number;
  assigneeId?: string | null;
  assignee?: UserMinimal | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskAttachment {
  id: string;
  taskId: string;
  fileName: string;
  fileUrl: string;
  storageProvider?: string;
  fileSize: number;
  mimeType: string;
  uploadedBy?: string;
  uploader?: UserMinimal;
  createdAt: string;
}

export interface TaskLink {
  id: string;
  taskId: string;
  createdById: string;
  createdBy?: UserMinimal;
  title: string;
  url: string;
  type: LinkType;
  createdAt: string;
  updatedAt: string;
}

export interface TaskCounts {
  comments: number;
  attachments: number;
  links: number;
  checklists: number;
}

export interface Task {
  id: string;
  columnId: string;
  sprintId?: string | null;
  key?: string | null;
  taskNumber?: number | null;
  assigneeId?: string | null;
  createdBy: string;
  title: string;
  description?: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string | null;
  order: number;
  isBacklog?: boolean;
  storyPoints?: number | null;
  estimatedHours?: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  assignee?: UserMinimal | null;
  creator?: UserMinimal;
  labels?: TaskLabel[];
  checklists?: TaskChecklistItem[];
  attachments?: TaskAttachment[];
  links?: TaskLink[];
  column?: {
    id: string;
    title: string;
    boardId?: string;
    board?: {
      id: string;
      title: string;
      project: {
        id: string;
        title: string;
        key: string;
        color: string;
        workspaceId?: string;
      };
    };
  };
  sprint?: {
    id: string;
    name: string;
    status: string;
  } | null;
  _count?: TaskCounts;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedTasksResponse {
  tasks: Task[];
  meta: PaginationMeta;
}

export interface MyTasksResponse extends PaginatedTasksResponse {
  grouped?: Record<string, Task[]>;
}

// DTOs
export interface CreateTaskRequest {
  title: string;
  description?: string | null;
  priority?: TaskPriority;
  status?: TaskStatus;
  assigneeId?: string | null;
  dueDate?: string | null;
  order?: number;
  storyPoints?: number | null;
  estimatedHours?: number | null;
  isBacklog?: boolean;
  sprintId?: string | null;
}

export type UpdateTaskRequest = Partial<CreateTaskRequest>;

export interface MoveTaskRequest {
  targetColumnId: string;
  targetOrder: number;
  status?: TaskStatus;
}

export interface BulkUpdateTasksRequest {
  taskIds: string[];
  data: Partial<CreateTaskRequest>;
}

export interface BulkDeleteTasksRequest {
  taskIds: string[];
}

export interface CreateChecklistItemRequest {
  title: string;
  assigneeId?: string | null;
  order?: number;
}

export interface UpdateChecklistItemRequest {
  title?: string;
  isCompleted?: boolean;
  assigneeId?: string | null;
  order?: number;
}

export interface CreateTaskLinkRequest {
  title: string;
  url: string;
  type: LinkType;
}

export interface UpdateTaskLinkRequest {
  title?: string;
  url?: string;
  type?: LinkType;
}

export interface ColumnTasksParams {
  page?: number;
  limit?: number;
  priority?: TaskPriority;
  status?: TaskStatus;
  assigneeId?: string;
  search?: string;
}

export interface MyTasksParams {
  page?: number;
  limit?: number;
  status?: TaskStatus;
  priority?: TaskPriority;
  projectId?: string;
  dueDate?: 'today' | 'overdue' | 'upcoming' | 'nodate';
  groupBy?: 'project' | 'priority' | 'status' | 'dueDate';
}
