'use client';

import { useQuery } from '@tanstack/react-query';
import { safetyApi } from '../api/safety.api';
import { safetyKeys } from './safety-keys';
import type {
  PaginatedActivitiesResponse,
  WorkspaceActivitiesQueryParams,
  TaskActivitiesQueryParams,
} from '../types/safety.types';

/**
 * Hook to query workspace-wide chronological activity events
 */
export function useWorkspaceActivities(
  workspaceId: string,
  params?: WorkspaceActivitiesQueryParams,
) {
  return useQuery<PaginatedActivitiesResponse>({
    queryKey: safetyKeys.workspaceActivities(workspaceId, params),
    queryFn: async () => {
      const res = await safetyApi.getWorkspaceActivities(workspaceId, params);
      return res.data;
    },
    enabled: Boolean(workspaceId),
    staleTime: 15 * 1000,
  });
}

/**
 * Hook to query activity history specific to a single task card
 */
export function useTaskActivities(
  taskId: string,
  params?: TaskActivitiesQueryParams,
) {
  return useQuery<PaginatedActivitiesResponse>({
    queryKey: safetyKeys.taskActivities(taskId, params),
    queryFn: async () => {
      const res = await safetyApi.getTaskActivities(taskId, params);
      return res.data;
    },
    enabled: Boolean(taskId),
    staleTime: 15 * 1000,
  });
}
