import type { AnalyticsInterval } from '../types/dashboard.types';
import type { WorkspaceTasksQueryDto } from '../types/workspace-tasks.types';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  search: (workspaceId: string, q: string, type = 'ALL', limit = 20) =>
    [...dashboardKeys.all, 'search', workspaceId, q, type, limit] as const,
  summary: (workspaceId: string, days = 30) =>
    [...dashboardKeys.all, 'summary', workspaceId, days] as const,
  distribution: (workspaceId: string) =>
    [...dashboardKeys.all, 'distribution', workspaceId] as const,
  productivity: (workspaceId: string, days = 30, interval: AnalyticsInterval = 'day') =>
    [...dashboardKeys.all, 'productivity', workspaceId, days, interval] as const,
  sprintHealth: (workspaceId: string) =>
    [...dashboardKeys.all, 'sprint-health', workspaceId] as const,
  projectRollups: (workspaceId: string) =>
    [...dashboardKeys.all, 'project-rollups', workspaceId] as const,
  workload: (workspaceId: string) =>
    [...dashboardKeys.all, 'workload', workspaceId] as const,
  workspaceTasks: (workspaceId: string, params: WorkspaceTasksQueryDto = {}) =>
    [...dashboardKeys.all, 'workspace-tasks', workspaceId, params] as const,
};
