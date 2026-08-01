import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import type { ApiResponse, Project } from '@/types/domain';
import { projectApi } from '../api/project.api';
import type { CreateProjectInput } from '../schemas/create-project.schema';

export function useCreateProject(workspaceId: string, onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<Project>,
    AxiosError<ApiResponse<unknown>>,
    CreateProjectInput
  >({
    mutationFn: (data: CreateProjectInput) => projectApi.createProject(workspaceId, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces', workspaceId, 'projects'] });
      toast.success(response.message || 'Project created successfully!');
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || 'Failed to create project. Please try again.';
      toast.error(errorMessage);
    },
  });
}
