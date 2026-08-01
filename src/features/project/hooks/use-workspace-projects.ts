import { useQuery } from '@tanstack/react-query';
import type { ApiResponse, Project } from '@/types/domain';
import { projectApi } from '../api/project.api';

export function useWorkspaceProjects(workspaceId: string) {
  return useQuery<ApiResponse<Project[]>>({
    queryKey: ['workspaces', workspaceId, 'projects'],
    queryFn: () => projectApi.getWorkspaceProjects(workspaceId),
    enabled: Boolean(workspaceId),
    staleTime: 1000 * 60 * 3, // 3 minutes cache
  });
}
