'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';
import { dashboardKeys } from './dashboard-keys';
import type { DashboardSummaryResponse } from '../types/dashboard.types';

export function useDashboardSummary(workspaceId: string) {
  return useQuery<DashboardSummaryResponse>({
    queryKey: dashboardKeys.summary(workspaceId),
    queryFn: async () => {
      const response = await dashboardApi.getDashboardSummary(workspaceId);
      return response.data;
    },
    enabled: Boolean(workspaceId),
    staleTime: 30000,
  });
}
