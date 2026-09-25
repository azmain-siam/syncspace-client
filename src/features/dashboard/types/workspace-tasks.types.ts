import type { TaskPriority, TaskStatus } from '@/types/domain';
import type { SprintStatus, UserMinimal } from './dashboard.types';

export type WorkspaceTasksDueDateFilter =
  | 'today'
  | 'overdue'
  | 'upcoming'
  | 'this_week'
  | 'nodate'
  | 'no_due_date';

export type WorkspaceTasksGroupBy =
  | 'none'
  | 'project'
  | 'priority'
  | 'status'
  | 'dueDate'
  | 'assignee';

export type WorkspaceTasksSortBy =
  | 'dueDate'
  | 'priority'
  | 'status'
  | 'createdAt'
  | 'updatedAt'
  | 'title'
  | 'order';

export interface TaskPermissions {
  canEdit: boolean;
  canDelete: boolean;
  canAssign: boolean;
}

export interface TaskLabelMinimal {
  id: string;
  name: string;
  color: string;
}

export interface WorkspaceTasksPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface WorkspaceTasksQueryDto {
  status?: TaskStatus | TaskStatus[] | string;
  priority?: TaskPriority | TaskPriority[] | string;
  assigneeId?: string;
  projectId?: string | string[];
  sprintId?: string;
  isBacklog?: boolean;
  dueDate?: WorkspaceTasksDueDateFilter;
  search?: string;
  sortBy?: WorkspaceTasksSortBy;
  sortOrder?: 'asc' | 'desc';
  groupBy?: WorkspaceTasksGroupBy;
  page?: number;
  limit?: number;
}

export interface WorkspaceTaskItem {
  id: string;
  key: string | null;
  taskNumber: number | null;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string | null;
  order: number;
  isBacklog: boolean;
  storyPoints: number | null;
  estimatedHours: number | null;
  createdAt: string;
  updatedAt: string;
  assignee: UserMinimal | null;
  creator: UserMinimal;
  permissions: TaskPermissions;
  column: {
    id: string;
    title: string;
    board: {
      id: string;
      title: string;
      project: {
        id: string;
        title: string;
        key: string | null;
        slug: string | null;
        color: string | null;
      };
    };
  };
  sprint: {
    id: string;
    name: string;
    status: SprintStatus;
  } | null;
  labels: TaskLabelMinimal[];
  _count: {
    comments: number;
    attachments: number;
    checklists: number;
    links: number;
  };
}

export interface FlatWorkspaceTasksResponse {
  tasks: WorkspaceTaskItem[];
  meta: WorkspaceTasksPaginationMeta;
}

export interface WorkspaceTaskDrilldown {
  title: string;
  description?: string;
  filters: WorkspaceTasksQueryDto;
}
