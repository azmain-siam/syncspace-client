import { apiClient } from '@/lib/api/api-client';
import type { ApiResponse } from '@/types/domain';
import type {
  PaginatedTrashResponse,
  TrashQueryParams,
  RestoreTrashItemPayload,
  RestoreTrashResponse,
  EmptyTrashQueryParams,
  EmptyTrashResponse,
  PaginatedActivitiesResponse,
  WorkspaceActivitiesQueryParams,
  TaskActivitiesQueryParams,
  PaginatedAuditLogsResponse,
  WorkspaceAuditLogsQueryParams,
} from '../types/safety.types';

export const safetyApi = {
  // 1. List soft-deleted tasks & projects in workspace trash bin
  getTrashItems: async (
    workspaceId: string,
    params?: TrashQueryParams,
  ): Promise<ApiResponse<PaginatedTrashResponse>> => {
    const response = await apiClient.get<ApiResponse<PaginatedTrashResponse>>(
      `/workspaces/${workspaceId}/trash`,
      { params },
    );
    return response.data;
  },

  // 2. Restore soft-deleted task or project back to active status
  restoreTrashItem: async (
    workspaceId: string,
    data: RestoreTrashItemPayload,
  ): Promise<ApiResponse<RestoreTrashResponse>> => {
    const response = await apiClient.post<ApiResponse<RestoreTrashResponse>>(
      `/workspaces/${workspaceId}/trash/restore`,
      data,
    );
    return response.data;
  },

  // 3. Permanently purge trash (empty all or specific item)
  emptyTrash: async (
    workspaceId: string,
    params?: EmptyTrashQueryParams,
  ): Promise<ApiResponse<EmptyTrashResponse>> => {
    const response = await apiClient.delete<ApiResponse<EmptyTrashResponse>>(
      `/workspaces/${workspaceId}/trash/empty`,
      { params },
    );
    return response.data;
  },

  // 4. Paginated workspace activity timeline
  getWorkspaceActivities: async (
    workspaceId: string,
    params?: WorkspaceActivitiesQueryParams,
  ): Promise<ApiResponse<PaginatedActivitiesResponse>> => {
    const response = await apiClient.get<ApiResponse<PaginatedActivitiesResponse>>(
      `/workspaces/${workspaceId}/activities`,
      { params },
    );
    return response.data;
  },

  // 5. Task-specific activity history stream
  getTaskActivities: async (
    taskId: string,
    params?: TaskActivitiesQueryParams,
  ): Promise<ApiResponse<PaginatedActivitiesResponse>> => {
    const response = await apiClient.get<ApiResponse<PaginatedActivitiesResponse>>(
      `/tasks/${taskId}/activities`,
      { params },
    );
    return response.data;
  },

  // 6. Security & compliance audit log feed
  getWorkspaceAuditLogs: async (
    workspaceId: string,
    params?: WorkspaceAuditLogsQueryParams,
  ): Promise<ApiResponse<PaginatedAuditLogsResponse>> => {
    const response = await apiClient.get<ApiResponse<PaginatedAuditLogsResponse>>(
      `/workspaces/${workspaceId}/audit-logs`,
      { params },
    );
    return response.data;
  },
};
