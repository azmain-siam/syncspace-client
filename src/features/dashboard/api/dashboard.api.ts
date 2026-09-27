import { apiClient } from '@/lib/api/api-client';
import type { ApiResponse } from '@/types/domain';
import type {
  AnalyticsInterval,
  DashboardSummaryResponse,
  MemberWorkloadItem,
  ProductivityMetricsResponse,
  ProjectRollupItem,
  SearchQueryParams,
  SearchResponse,
  TaskDistributionResponse,
  WorkspaceSprintHealthResponse,
} from '../types/dashboard.types';
import type {
  FlatWorkspaceTasksResponse,
  WorkspaceTasksQueryDto,
} from '../types/workspace-tasks.types';

function serializeListParam(
  value: string | string[] | undefined,
): string | undefined {
  if (value == null) return undefined;
  return Array.isArray(value) ? value.join(',') : value;
}

function toWorkspaceTaskParams(params: WorkspaceTasksQueryDto = {}) {
  return {
    ...params,
    status: serializeListParam(
      typeof params.status === 'string' || Array.isArray(params.status)
        ? params.status
        : undefined,
    ),
    priority: serializeListParam(
      typeof params.priority === 'string' || Array.isArray(params.priority)
        ? params.priority
        : undefined,
    ),
    projectId: serializeListParam(
      typeof params.projectId === 'string' || Array.isArray(params.projectId)
        ? params.projectId
        : undefined,
    ),
    groupBy: params.groupBy ?? 'none',
  };
}

export const dashboardApi = {
  workspaceSearch: async (
    workspaceId: string,
    params: SearchQueryParams,
  ): Promise<ApiResponse<SearchResponse>> => {
    const response = await apiClient.get<ApiResponse<SearchResponse>>(
      `/workspaces/${workspaceId}/search`,
      { params },
    );
    return response.data;
  },

  getDashboardSummary: async (
    workspaceId: string,
    params?: { days?: number },
  ): Promise<ApiResponse<DashboardSummaryResponse>> => {
    const response = await apiClient.get<ApiResponse<DashboardSummaryResponse>>(
      `/workspaces/${workspaceId}/dashboard/summary`,
      { params },
    );
    return response.data;
  },

  getTaskDistribution: async (
    workspaceId: string,
  ): Promise<ApiResponse<TaskDistributionResponse>> => {
    const response = await apiClient.get<ApiResponse<TaskDistributionResponse>>(
      `/workspaces/${workspaceId}/dashboard/task-distribution`,
    );
    return response.data;
  },

  getProductivityMetrics: async (
    workspaceId: string,
    params?: { days?: number; interval?: AnalyticsInterval },
  ): Promise<ApiResponse<ProductivityMetricsResponse>> => {
    const response = await apiClient.get<ApiResponse<ProductivityMetricsResponse>>(
      `/workspaces/${workspaceId}/dashboard/productivity`,
      { params },
    );
    return response.data;
  },

  getSprintHealth: async (
    workspaceId: string,
  ): Promise<ApiResponse<WorkspaceSprintHealthResponse>> => {
    const response = await apiClient.get<ApiResponse<WorkspaceSprintHealthResponse>>(
      `/workspaces/${workspaceId}/dashboard/sprint-health`,
    );
    return response.data;
  },

  getProjectRollups: async (
    workspaceId: string,
  ): Promise<ApiResponse<ProjectRollupItem[]>> => {
    const response = await apiClient.get<ApiResponse<ProjectRollupItem[]>>(
      `/workspaces/${workspaceId}/dashboard/project-rollups`,
    );
    return response.data;
  },

  getMemberWorkload: async (
    workspaceId: string,
  ): Promise<ApiResponse<MemberWorkloadItem[]>> => {
    const response = await apiClient.get<ApiResponse<MemberWorkloadItem[]>>(
      `/workspaces/${workspaceId}/dashboard/member-workload`,
    );
    return response.data;
  },

  getWorkspaceTasks: async (
    workspaceId: string,
    params: WorkspaceTasksQueryDto = {},
  ): Promise<ApiResponse<FlatWorkspaceTasksResponse>> => {
    const response = await apiClient.get<ApiResponse<FlatWorkspaceTasksResponse>>(
      `/workspaces/${workspaceId}/tasks`,
      { params: toWorkspaceTaskParams(params) },
    );
    return response.data;
  },
};
