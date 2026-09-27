import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import type { ApiResponse } from '@/types/domain';
import { taskApi } from '../api/task.api';
import type {
  TaskLink,
  CreateTaskLinkRequest,
  UpdateTaskLinkRequest,
} from '../types/task.types';

// 1. Get task links
export function useLinks(taskId?: string) {
  return useQuery({
    queryKey: ['tasks', taskId, 'links'],
    queryFn: async () => {
      if (!taskId) throw new Error('Task ID is required');
      return taskApi.getLinks(taskId);
    },
    enabled: Boolean(taskId),
  });
}

// 2. Create task link
export function useCreateLink(
  taskId: string,
  onSuccessCallback?: (link: TaskLink) => void,
) {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<TaskLink>,
    AxiosError<ApiResponse<unknown>>,
    CreateTaskLinkRequest
  >({
    mutationFn: (data: CreateTaskLinkRequest) => taskApi.createLink(taskId, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId, 'links'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] });
      toast.success(response.message || 'Link attached successfully');
      if (onSuccessCallback && response.data) {
        onSuccessCallback(response.data);
      }
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || 'Failed to attach link.';
      toast.error(errorMessage);
    },
  });
}

// 3. Update task link
export function useUpdateLink(
  taskId: string,
  onSuccessCallback?: () => void,
) {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<TaskLink>,
    AxiosError<ApiResponse<unknown>>,
    { linkId: string; data: UpdateTaskLinkRequest }
  >({
    mutationFn: ({ linkId, data }) => taskApi.updateLink(taskId, linkId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId, 'links'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] });
      toast.success('Link updated successfully');
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || 'Failed to update link.';
      toast.error(errorMessage);
    },
  });
}

// 4. Delete task link
export function useDeleteLink(
  taskId: string,
  onSuccessCallback?: () => void,
) {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<null>,
    AxiosError<ApiResponse<unknown>>,
    string // linkId
  >({
    mutationFn: (linkId: string) => taskApi.deleteLink(taskId, linkId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId, 'links'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] });
      toast.success(response.message || 'Link removed');
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || 'Failed to remove link.';
      toast.error(errorMessage);
    },
  });
}
