'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';
import { dashboardKeys } from './dashboard-keys';
import type { WorkspaceSprintHealthResponse } from '../types/dashboard.types';

export function useWorkspaceSprintHealth(workspaceId: string, enabled = true) {
  return useQuery<WorkspaceSprintHealthResponse>({
    queryKey: dashboardKeys.sprintHealth(workspaceId),
    queryFn: async () => {
      const response = await dashboardApi.getSprintHealth(workspaceId);
      return response.data;
    },
    enabled: Boolean(workspaceId) && enabled,
    staleTime: 30000,
  });
}
