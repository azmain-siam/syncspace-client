import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import type { ApiResponse } from '@/types/domain';
import { taskApi } from '../api/task.api';
import type { Task, BulkUpdateTasksRequest } from '../types/task.types';

export function useBulkUpdateTasks(
  workspaceId: string,
  projectId?: string,
  boardId?: string,
  onSuccessCallback?: () => void,
) {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<{ updatedCount: number; tasks: Task[] }>,
    AxiosError<ApiResponse<unknown>>,
    BulkUpdateTasksRequest
  >({
    mutationFn: (data: BulkUpdateTasksRequest) =>
      taskApi.bulkUpdateTasks(data, workspaceId),
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
        response.message || `Updated ${response.data?.updatedCount || 0} tasks`,
      );
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || 'Failed to update tasks in bulk.';
      toast.error(errorMessage);
    },
  });
}
