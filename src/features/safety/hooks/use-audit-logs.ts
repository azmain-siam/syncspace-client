'use client';

import { useQuery } from '@tanstack/react-query';
import { safetyApi } from '../api/safety.api';
import { safetyKeys } from './safety-keys';
import type {
  PaginatedAuditLogsResponse,
  WorkspaceAuditLogsQueryParams,
} from '../types/safety.types';

/**
 * Hook to query administrative security and compliance audit logs
 */
export function useWorkspaceAuditLogs(
  workspaceId: string,
  params?: WorkspaceAuditLogsQueryParams,
) {
  return useQuery<PaginatedAuditLogsResponse>({
    queryKey: safetyKeys.auditLogs(workspaceId, params),
    queryFn: async () => {
      const res = await safetyApi.getWorkspaceAuditLogs(workspaceId, params);
      return res.data;
    },
    enabled: Boolean(workspaceId),
    staleTime: 30 * 1000,
  });
}
