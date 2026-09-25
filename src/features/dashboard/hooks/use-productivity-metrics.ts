'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';
import { dashboardKeys } from './dashboard-keys';
import type { AnalyticsInterval, ProductivityMetricsResponse } from '../types/dashboard.types';

export function useProductivityMetrics(
  workspaceId: string,
  days = 30,
  interval: AnalyticsInterval = 'day',
  enabled = true,
) {
  return useQuery<ProductivityMetricsResponse>({
    queryKey: dashboardKeys.productivity(workspaceId, days, interval),
    queryFn: async () => {
      const response = await dashboardApi.getProductivityMetrics(workspaceId, {
        days,
        interval,
      });
      return response.data;
    },
    enabled: Boolean(workspaceId) && enabled,
    staleTime: 60000,
    placeholderData: keepPreviousData,
  });
}
