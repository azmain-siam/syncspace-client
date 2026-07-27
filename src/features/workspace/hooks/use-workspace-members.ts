import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import type { ApiResponse, WorkspaceMember } from '@/types/domain';
import { workspaceApi } from '../api/workspace.api';

export function useWorkspaceMembers(workspaceId: string) {
  return useQuery<ApiResponse<WorkspaceMember[]>, AxiosError<ApiResponse<unknown>>>({
    queryKey: ['workspaces', workspaceId, 'members'],
    queryFn: () => workspaceApi.getWorkspaceMembers(workspaceId),
    enabled: !!workspaceId,
    staleTime: 1000 * 60 * 2, // 2 minutes cache
  });
}
