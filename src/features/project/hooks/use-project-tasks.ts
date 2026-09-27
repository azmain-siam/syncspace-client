import { useQuery } from '@tanstack/react-query';
import type { ApiResponse } from '@/types/domain';
import { projectApi } from '../api/project.api';
import { projectKeys } from './project-keys';
import type { ProjectTaskItem, ProjectTasksResponse } from '../types/project.types';

export function useProjectTasks(
  workspaceId: string,
  projectId: string,
  options?: {
    enabled?: boolean;
    initialData?: ProjectTasksResponse | ProjectTaskItem[];
  },
) {
  return useQuery<ApiResponse<ProjectTasksResponse | ProjectTaskItem[]>>({
    queryKey: projectKeys.tasks(workspaceId, projectId),
    queryFn: () => projectApi.getProjectTasks(workspaceId, projectId),
    enabled: Boolean(workspaceId) && Boolean(projectId) && (options?.enabled ?? true),
    initialData: options?.initialData
      ? {
          success: true,
          statusCode: 200,
          message: 'OK',
          data: options.initialData,
        }
      : undefined,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
