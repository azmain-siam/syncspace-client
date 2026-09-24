'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';
import { dashboardKeys } from './dashboard-keys';
import type { ProductivityMetricsResponse } from '../types/dashboard.types';

export function useProductivityMetrics(workspaceId: string, days = 30) {
  return useQuery<ProductivityMetricsResponse>({
    queryKey: dashboardKeys.productivity(workspaceId, days),
    queryFn: async () => {
      const response = await dashboardApi.getProductivityMetrics(workspaceId, { days });
      return response.data;
    },
    enabled: Boolean(workspaceId),
    staleTime: 30000,
  });
}
