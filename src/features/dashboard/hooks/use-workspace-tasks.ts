'use client';

import { keepPreviousData, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';
import { dashboardKeys } from './dashboard-keys';
import type {
  FlatWorkspaceTasksResponse,
  WorkspaceTasksQueryDto,
} from '../types/workspace-tasks.types';

export function useWorkspaceTasks(
  workspaceId: string,
  params: WorkspaceTasksQueryDto = {},
  enabled = true,
) {
  const flatParams: WorkspaceTasksQueryDto = {
    ...params,
    groupBy: 'none',
  };

  return useQuery<FlatWorkspaceTasksResponse>({
    queryKey: dashboardKeys.workspaceTasks(workspaceId, flatParams),
    queryFn: async () => {
      const response = await dashboardApi.getWorkspaceTasks(workspaceId, flatParams);
      return response.data;
    },
    enabled: Boolean(workspaceId) && enabled,
    staleTime: 15000,
    placeholderData: keepPreviousData,
  });
}

export function useWorkspaceTasksInfinite(
  workspaceId: string,
  params: WorkspaceTasksQueryDto = {},
  enabled = true,
) {
  const flatParams: WorkspaceTasksQueryDto = {
    ...params,
    groupBy: 'none',
    page: undefined,
  };

  return useInfiniteQuery({
    queryKey: [...dashboardKeys.workspaceTasks(workspaceId, flatParams), 'infinite'] as const,
    queryFn: async ({ pageParam }) => {
      const response = await dashboardApi.getWorkspaceTasks(workspaceId, {
        ...flatParams,
        page: pageParam,
        limit: params.limit ?? 20,
      });
      return response.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
    enabled: Boolean(workspaceId) && enabled,
    staleTime: 15000,
  });
}
