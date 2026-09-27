import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import type { ApiResponse } from '@/types/domain';
import { taskApi } from '../api/task.api';
import type { BulkDeleteTasksRequest } from '../types/task.types';

export function useBulkDeleteTasks(
  workspaceId: string,
  projectId?: string,
  boardId?: string,
  onSuccessCallback?: () => void,
) {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<{ deletedCount: number; taskIds: string[] }>,
    AxiosError<ApiResponse<unknown>>,
    BulkDeleteTasksRequest
  >({
    mutationFn: (data: BulkDeleteTasksRequest) => taskApi.bulkDeleteTasks(data),
    onSuccess: (response) => {
      if (projectId && boardId) {
        queryClient.invalidateQueries({
          queryKey: ['workspaces', workspaceId, 'projects', projectId, 'boards', boardId],
        });
      }
      queryClient.invalidateQueries({
        queryKey: ['workspaces', workspaceId, 'my-tasks'],
      });
      toast.success(
        response.message || `Deleted ${response.data?.deletedCount || 0} tasks`,
      );
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || 'Failed to delete tasks in bulk.';
      toast.error(errorMessage);
    },
  });
}
