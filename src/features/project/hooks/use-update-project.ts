import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import type { ApiResponse, Project } from '@/types/domain';
import { projectApi } from '../api/project.api';
import type { UpdateProjectInput } from '../schemas/update-project.schema';

export function useUpdateProject(
  workspaceId: string,
  projectId: string,
  onSuccessCallback?: () => void,
) {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<Project>,
    AxiosError<ApiResponse<unknown>>,
    UpdateProjectInput
  >({
    mutationFn: (data: UpdateProjectInput) =>
      projectApi.updateProject(workspaceId, projectId, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces', workspaceId, 'projects'] });
      queryClient.invalidateQueries({
        queryKey: ['workspaces', workspaceId, 'projects', projectId],
      });
      toast.success(response.message || 'Project updated successfully!');
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || 'Failed to update project. Please try again.';
      toast.error(errorMessage);
    },
  });
}
