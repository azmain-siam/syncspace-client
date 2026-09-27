import type { TaskPriority, TaskStatus, UserMinimal } from '@/features/task/types/task.types';

export enum SprintStatus {
  PLANNING = 'PLANNING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
}

export interface SprintMetrics {
  totalTasks: number;
  completedTasks: number;
  totalStoryPoints: number;
  completedStoryPoints: number;
  totalEstimatedHours: number;
  completionPercentage: number; // 0 to 100
}

export interface SprintTask {
  id: string;
  columnId: string;
  sprintId: string | null;
  key: string | null;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  order: number;
  isBacklog: boolean;
  storyPoints: number | null;
  estimatedHours: number | null;
  assignee: UserMinimal | null;
  column?: {
    id: string;
    title: string;
    boardId?: string;
  };
  labels?: Array<{ id: string; name: string; color: string }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface Sprint {
  id: string;
  projectId: string;
  name: string;
  goal: string | null;
  startDate: string | null;
  endDate: string | null;
  status: SprintStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  project?: {
    id: string;
    title: string;
    key: string;
    workspaceId: string;
  };
  metrics?: SprintMetrics;
  tasks?: SprintTask[];
}

export interface SprintCompletionSummary {
  completedTasksCount: number;
  rolledOverTasksCount: number;
  completedStoryPoints: number;
  rolledOverTo: 'NEXT_SPRINT' | 'BACKLOG';
}

export interface SprintCompletionResponse extends Sprint {
  summary: SprintCompletionSummary;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface BacklogPaginationMeta extends PaginationMeta {
  totalStoryPoints: number;
  totalEstimatedHours: number;
}

export interface PaginatedSprintsResponse {
  data: Sprint[];
  meta: PaginationMeta;
}

export interface BacklogResponse {
  data: SprintTask[];
  meta: BacklogPaginationMeta;
}

// Request DTOs
export interface CreateSprintRequest {
  name: string;
  goal?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

export interface UpdateSprintRequest {
  name?: string;
  goal?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  status?: SprintStatus;
}

export interface CompleteSprintRequest {
  moveToSprintId?: string | null;
}

export interface AssignTaskToSprintRequest {
  sprintId?: string | null;
  isBacklog?: boolean;
}

export interface AssignTaskToSprintResponse {
  id: string;
  sprintId: string | null;
  isBacklog: boolean;
  sprint?: {
    id: string;
    name: string;
    status: SprintStatus;
  } | null;
}

export interface SprintQueryParams {
  status?: SprintStatus | string;
  page?: number;
  limit?: number;
}

export interface BacklogQueryParams {
  priority?: TaskPriority;
  status?: TaskStatus;
  assigneeId?: string;
  search?: string;
  page?: number;
  limit?: number;
}
