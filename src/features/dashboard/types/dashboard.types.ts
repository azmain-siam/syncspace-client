import { TaskPriority, TaskStatus, WorkspaceRole } from '@/types/domain';

export enum SearchType {
  ALL = 'ALL',
  PROJECTS = 'PROJECTS',
  TASKS = 'TASKS',
  COMMENTS = 'COMMENTS',
  MEMBERS = 'MEMBERS',
}

export interface UserMinimal {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}

export interface SearchProjectResult {
  id: string;
  title: string;
  slug: string | null;
  description: string | null;
  status: string;
  priority: string;
  updatedAt: string;
}

export interface SearchTaskResult {
  id: string;
  key: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  columnId: string;
  assignee: UserMinimal | null;
  column: {
    id: string;
    title: string;
    board: {
      id: string;
      title: string;
      projectId: string;
    };
  };
}

export interface SearchCommentResult {
  id: string;
  content: string;
  isEdited: boolean;
  createdAt: string;
  taskId: string;
  user: UserMinimal;
  task: {
    id: string;
    title: string;
  };
}

export interface SearchMemberResult extends UserMinimal {
  memberId: string;
  role: WorkspaceRole | string;
  joinedAt: string;
}

export interface WorkspaceSearchResults {
  projects?: SearchProjectResult[];
  tasks?: SearchTaskResult[];
  comments?: SearchCommentResult[];
  members?: SearchMemberResult[];
}

export interface SearchResponse {
  query: string;
  type: SearchType;
  results: WorkspaceSearchResults;
}

export interface SearchQueryParams {
  q: string;
  type?: SearchType | 'ALL' | 'PROJECTS' | 'TASKS' | 'COMMENTS' | 'MEMBERS';
  limit?: number;
}

export interface DashboardSummaryResponse {
  projectsCount: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  membersCount: number;
  activitiesCount: number;
  completionPercentage: number;
  totalStoryPoints: number;
  completedStoryPoints: number;
  totalEstimatedHours: number;
}

export interface TaskDistributionResponse {
  byStatus: Array<{ status: TaskStatus; count: number }>;
  byPriority: Array<{ priority: TaskPriority; count: number }>;
}

export interface ProductivityMetricsResponse {
  timeframeDays: number;
  startDate: string;
  totalCreatedInPeriod: number;
  totalCompletedInPeriod: number;
}

export interface MemberWorkloadItem {
  memberId: string;
  role: WorkspaceRole | string;
  user: UserMinimal;
  assignedCount: number;
  completedCount: number;
  overdueCount: number;
  completionRate: number; // 0 to 100
  totalStoryPoints: number;
  completedStoryPoints: number;
  totalEstimatedHours: number;
}
