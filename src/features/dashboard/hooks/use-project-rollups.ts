'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';
import { dashboardKeys } from './dashboard-keys';
import type { ProjectRollupItem } from '../types/dashboard.types';

export function useProjectRollups(workspaceId: string, enabled = true) {
  return useQuery<ProjectRollupItem[]>({
    queryKey: dashboardKeys.projectRollups(workspaceId),
    queryFn: async () => {
      const response = await dashboardApi.getProjectRollups(workspaceId);
      return response.data;
    },
    enabled: Boolean(workspaceId) && enabled,
    staleTime: 30000,
  });
}
