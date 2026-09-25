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
  username?: string;
  name: string;
  email: string;
  avatar: string | null;
}

export type AnalyticsInterval = 'day' | 'week';

export type SprintHealthStatus = 'ON_TRACK' | 'AT_RISK' | 'BEHIND' | 'OVERDUE';
export type ProjectHealthStatus =
  | 'HEALTHY'
  | 'NEEDS_ATTENTION'
  | 'CRITICAL'
  | 'ON_HOLD'
  | 'COMPLETED';
export type MemberCapacityStatus = 'OPTIMAL' | 'OVERLOADED' | 'UNDERLOADED';
export type SprintStatus = 'PLANNING' | 'ACTIVE' | 'COMPLETED';

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

export interface PeriodMetrics {
  startDate: string;
  endDate: string;
  createdTasks: number;
  completedTasks: number;
  completedStoryPoints: number;
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
  periodDays?: number;
  currentPeriod?: PeriodMetrics;
  previousPeriod?: PeriodMetrics;
  deltas?: {
    createdTasksDelta: number;
    completedTasksDelta: number;
    completedStoryPointsDelta: number;
  };
}

export interface TaskDistributionResponse {
  byStatus: Array<{ status: TaskStatus; count: number }>;
  byPriority: Array<{ priority: TaskPriority; count: number }>;
}

export interface ProductivityTimelineItem {
  date: string;
  label: string;
  createdCount: number;
  completedCount: number;
  accumulatedCreated: number;
  accumulatedCompleted: number;
  netVelocity: number;
}

export interface ProductivityMetricsResponse {
  timeframeDays: number;
  interval?: AnalyticsInterval;
  startDate: string;
  endDate?: string;
  totalCreatedInPeriod: number;
  totalCompletedInPeriod: number;
  netVelocity?: number;
  avgThroughputPerDay?: number;
  timeline?: ProductivityTimelineItem[];
}

export interface SprintHealthItem {
  id: string;
  name: string;
  goal: string | null;
  startDate: string | null;
  endDate: string | null;
  status: SprintStatus;
  project: {
    id: string;
    title: string;
    key: string | null;
    slug: string | null;
    color: string | null;
  };
  taskCounts: {
    total: number;
    todo: number;
    inProgress: number;
    review: number;
    done: number;
  };
  storyPoints: {
    total: number;
    completed: number;
    inProgress: number;
    remaining: number;
  };
  estimatedHours: {
    total: number;
    completed: number;
  };
  totalDays: number | null;
  daysRemaining: number | null;
  timeElapsedPercentage: number;
  completionPercentage: number;
  isOverdue: boolean;
  healthStatus: SprintHealthStatus;
}

export interface WorkspaceSprintHealthResponse {
  activeSprintsCount: number;
  totalCommittedStoryPoints: number;
  totalCompletedStoryPoints: number;
  overallSprintProgressPercentage: number;
  sprints: SprintHealthItem[];
}

export interface ProjectRollupItem {
  id: string;
  title: string;
  key: string | null;
  slug: string | null;
  description: string | null;
  status: string;
  priority: string;
  color: string | null;
  startDate: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: UserMinimal;
  membersCount: number;
  boardsCount: number;
  taskCounts: {
    total: number;
    todo: number;
    inProgress: number;
    review: number;
    done: number;
    overdue: number;
  };
  capacity: {
    totalStoryPoints: number;
    completedStoryPoints: number;
    inProgressStoryPoints: number;
    totalEstimatedHours: number;
  };
  completionPercentage: number;
  activeSprint: {
    id: string;
    name: string;
    startDate: string | null;
    endDate: string | null;
    status: SprintStatus;
    totalTasks: number;
    completedTasks: number;
    completionPercentage: number;
  } | null;
  healthStatus: ProjectHealthStatus;
}

export interface MemberWorkloadItem {
  memberId: string;
  role: WorkspaceRole | string;
  user: UserMinimal;
  assignedCount: number;
  todoCount?: number;
  inProgressCount?: number;
  reviewCount?: number;
  completedCount: number;
  overdueCount: number;
  completionRate: number;
  totalStoryPoints: number;
  completedStoryPoints: number;
  inProgressStoryPoints?: number;
  totalEstimatedHours: number;
  capacityStatus?: MemberCapacityStatus;
}
