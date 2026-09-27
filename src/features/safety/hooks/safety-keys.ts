import type {
  TrashQueryParams,
  WorkspaceActivitiesQueryParams,
  TaskActivitiesQueryParams,
  WorkspaceAuditLogsQueryParams,
} from '../types/safety.types';

export const safetyKeys = {
  all: ['safety'] as const,
  trash: (workspaceId: string, params?: TrashQueryParams) =>
    ['safety', 'trash', workspaceId, params] as const,
  workspaceActivities: (
    workspaceId: string,
    params?: WorkspaceActivitiesQueryParams,
  ) => ['safety', 'workspace-activities', workspaceId, params] as const,
  taskActivities: (taskId: string, params?: TaskActivitiesQueryParams) =>
    ['safety', 'task-activities', taskId, params] as const,
  auditLogs: (
    workspaceId: string,
    params?: WorkspaceAuditLogsQueryParams,
  ) => ['safety', 'audit-logs', workspaceId, params] as const,
};
