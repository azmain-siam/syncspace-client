'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';
import { dashboardKeys } from './dashboard-keys';
import type { DashboardSummaryResponse } from '../types/dashboard.types';

export function useDashboardSummary(
  workspaceId: string,
  days = 30,
  enabled = true,
) {
  return useQuery<DashboardSummaryResponse>({
    queryKey: dashboardKeys.summary(workspaceId, days),
    queryFn: async () => {
      const response = await dashboardApi.getDashboardSummary(workspaceId, { days });
      return response.data;
    },
    enabled: Boolean(workspaceId) && enabled,
    staleTime: 30000,
  });
}
