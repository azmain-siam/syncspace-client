import { useQuery } from '@tanstack/react-query';
import type { ApiResponse, Project } from '@/types/domain';
import { projectApi } from '../api/project.api';

export function useProjectDetail(workspaceId: string, projectId: string) {
  return useQuery<ApiResponse<Project>>({
    queryKey: ['workspaces', workspaceId, 'projects', projectId],
    queryFn: () => projectApi.getProject(workspaceId, projectId),
    enabled: Boolean(workspaceId) && Boolean(projectId),
    staleTime: 1000 * 60 * 3,
  });
}
