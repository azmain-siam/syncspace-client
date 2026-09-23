import { apiClient } from '@/lib/api/api-client';
import type { ApiResponse } from '@/types/domain';
import type {
  DashboardSummaryResponse,
  MemberWorkloadItem,
  ProductivityMetricsResponse,
  SearchQueryParams,
  SearchResponse,
  TaskDistributionResponse,
} from '../types/dashboard.types';

export const dashboardApi = {
  // 1. Cross-entity workspace search (Projects, Tasks, Comments, Members)
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

  // 2. Executive Dashboard KPI Summary
  getDashboardSummary: async (
    workspaceId: string,
  ): Promise<ApiResponse<DashboardSummaryResponse>> => {
    const response = await apiClient.get<ApiResponse<DashboardSummaryResponse>>(
      `/workspaces/${workspaceId}/dashboard/summary`,
    );
    return response.data;
  },

  // 3. Task Distribution by Status & Priority
  getTaskDistribution: async (
    workspaceId: string,
  ): Promise<ApiResponse<TaskDistributionResponse>> => {
    const response = await apiClient.get<ApiResponse<TaskDistributionResponse>>(
      `/workspaces/${workspaceId}/dashboard/task-distribution`,
    );
    return response.data;
  },

  // 4. Productivity Velocity Metrics
  getProductivityMetrics: async (
    workspaceId: string,
    params?: { days?: number },
  ): Promise<ApiResponse<ProductivityMetricsResponse>> => {
    const response = await apiClient.get<ApiResponse<ProductivityMetricsResponse>>(
      `/workspaces/${workspaceId}/dashboard/productivity`,
      { params },
    );
    return response.data;
  },

  // 5. Team Member Workload Breakdown
  getMemberWorkload: async (
    workspaceId: string,
  ): Promise<ApiResponse<MemberWorkloadItem[]>> => {
    const response = await apiClient.get<ApiResponse<MemberWorkloadItem[]>>(
      `/workspaces/${workspaceId}/dashboard/member-workload`,
    );
    return response.data;
  },
};
