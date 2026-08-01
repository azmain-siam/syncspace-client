import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import type { ApiResponse, Project } from '@/types/domain';
import { projectApi } from '../api/project.api';

export function useArchiveProject(workspaceId: string, onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<Project>,
    AxiosError<ApiResponse<unknown>>,
    string
  >({
    mutationFn: (projectId: string) => projectApi.archiveProject(workspaceId, projectId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces', workspaceId, 'projects'] });
      toast.success(response.message || 'Project archived successfully!');
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || 'Failed to archive project. Please try again.';
      toast.error(errorMessage);
    },
  });
}
