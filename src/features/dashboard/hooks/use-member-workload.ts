'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';
import { dashboardKeys } from './dashboard-keys';
import type { MemberWorkloadItem } from '../types/dashboard.types';

export function useMemberWorkload(workspaceId: string, enabled = true) {
  return useQuery<MemberWorkloadItem[]>({
    queryKey: dashboardKeys.workload(workspaceId),
    queryFn: async () => {
      const response = await dashboardApi.getMemberWorkload(workspaceId);
      return response.data;
    },
    enabled: Boolean(workspaceId) && enabled,
    staleTime: 30000,
  });
}
