'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';
import { dashboardKeys } from './dashboard-keys';
import type { TaskDistributionResponse } from '../types/dashboard.types';

export function useTaskDistribution(workspaceId: string) {
  return useQuery<TaskDistributionResponse>({
    queryKey: dashboardKeys.distribution(workspaceId),
    queryFn: async () => {
      const response = await dashboardApi.getTaskDistribution(workspaceId);
      return response.data;
    },
    enabled: Boolean(workspaceId),
    staleTime: 30000,
  });
}
