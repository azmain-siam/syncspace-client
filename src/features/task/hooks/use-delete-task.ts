import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import type { ApiResponse } from '@/types/domain';
import { taskApi } from '../api/task.api';
import { taskKeys } from './task-keys';

export function useDeleteTask(
  workspaceId: string,
  projectId?: string,
  boardId?: string,
  onSuccessCallback?: () => void,
) {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<null>,
    AxiosError<ApiResponse<unknown>>,
    string
  >({
    mutationFn: (taskId: string) => taskApi.deleteTask(taskId),
    onSuccess: (response, taskId) => {
      // Remove specific task cache
      queryClient.removeQueries({ queryKey: taskKeys.detail(taskId) });

      // Invalidate board details if projectId and boardId are provided
      if (projectId && boardId) {
        queryClient.invalidateQueries({
          queryKey: ['workspaces', workspaceId, 'projects', projectId, 'boards', boardId],
        });
      }

      // Invalidate column tasks
      queryClient.invalidateQueries({
        queryKey: ['columns'],
      });

      // Invalidate personal inbox
      queryClient.invalidateQueries({
        queryKey: ['workspaces', workspaceId, 'my-tasks'],
      });

      toast.success(response.message || 'Task deleted successfully!');
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || 'Failed to delete task. Please try again.';
      toast.error(errorMessage);
    },
  });
}
