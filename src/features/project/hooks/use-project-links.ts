import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import type { ApiResponse } from '@/types/domain';
import { projectApi } from '../api/project.api';
import { projectKeys } from './project-keys';
import type { ProjectLink } from '../types/project.types';

export interface CreateProjectLinkInput {
  title: string;
  url: string;
  type?: string;
}

export function useProjectLinks(
  workspaceId: string,
  projectId: string,
  initialData?: ProjectLink[],
) {
  return useQuery<ApiResponse<ProjectLink[]>>({
    queryKey: projectKeys.links(workspaceId, projectId),
    queryFn: () => projectApi.getProjectLinks(workspaceId, projectId),
    enabled: Boolean(workspaceId) && Boolean(projectId),
    initialData: initialData
      ? {
          success: true,
          statusCode: 200,
          message: 'OK',
          data: initialData,
        }
      : undefined,
    staleTime: 1000 * 60 * 3,
  });
}

export function useCreateProjectLink(
  workspaceId: string,
  projectId: string,
  onSuccessCallback?: () => void,
) {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<ProjectLink>,
    AxiosError<ApiResponse<unknown>>,
    CreateProjectLinkInput
  >({
    mutationFn: (data: CreateProjectLinkInput) =>
      projectApi.createProjectLink(workspaceId, projectId, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.links(workspaceId, projectId),
      });
      queryClient.invalidateQueries({
        queryKey: projectKeys.detail(workspaceId, projectId),
      });
      queryClient.invalidateQueries({
        queryKey: projectKeys.workspaceProjects(workspaceId),
      });

      toast.success(response.message || 'Resource link attached successfully!');
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || 'Failed to attach link. Please try again.';
      toast.error(errorMessage);
    },
  });
}

export function useDeleteProjectLink(
  workspaceId: string,
  projectId: string,
  onSuccessCallback?: () => void,
) {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<null>, AxiosError<ApiResponse<unknown>>, string>({
    mutationFn: (linkId: string) =>
      projectApi.deleteProjectLink(workspaceId, projectId, linkId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.links(workspaceId, projectId),
      });
      queryClient.invalidateQueries({
        queryKey: projectKeys.detail(workspaceId, projectId),
      });
      queryClient.invalidateQueries({
        queryKey: projectKeys.workspaceProjects(workspaceId),
      });

      toast.success(response.message || 'Resource link removed.');
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || 'Failed to remove link. Please try again.';
      toast.error(errorMessage);
    },
  });
}
