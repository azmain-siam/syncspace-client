import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import type { ApiResponse } from '@/types/domain';
import { ProjectHealth } from '@/types/domain';
import { projectApi } from '../api/project.api';
import { projectKeys } from './project-keys';
import type { ProjectStatusUpdate } from '../types/project.types';

export interface CreateStatusUpdateInput {
  health: ProjectHealth;
  message: string;
}

export function useProjectStatusUpdates(workspaceId: string, projectId: string) {
  return useQuery<ApiResponse<ProjectStatusUpdate[]>>({
    queryKey: projectKeys.statusUpdates(workspaceId, projectId),
    queryFn: () => projectApi.getProjectStatusUpdates(workspaceId, projectId),
    enabled: Boolean(workspaceId) && Boolean(projectId),
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateProjectStatusUpdate(
  workspaceId: string,
  projectId: string,
  onSuccessCallback?: () => void,
) {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<ProjectStatusUpdate>,
    AxiosError<ApiResponse<unknown>>,
    CreateStatusUpdateInput
  >({
    mutationFn: (data: CreateStatusUpdateInput) =>
      projectApi.createProjectStatusUpdate(workspaceId, projectId, data),
    onSuccess: (response) => {
      // Invalidate status updates feed
      queryClient.invalidateQueries({
        queryKey: projectKeys.statusUpdates(workspaceId, projectId),
      });
      // Invalidate project detail (health changed on project!)
      queryClient.invalidateQueries({
        queryKey: projectKeys.detail(workspaceId, projectId),
      });
      // Invalidate workspace projects list (for portfolio badges)
      queryClient.invalidateQueries({
        queryKey: projectKeys.workspaceProjects(workspaceId),
      });

      toast.success(response.message || 'Status update posted successfully!');
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || 'Failed to post status update. Please try again.';
      toast.error(errorMessage);
    },
  });
}
