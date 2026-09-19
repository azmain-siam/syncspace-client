import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import type { ApiResponse } from '@/types/domain';
import { taskApi } from '../api/task.api';
import type { Task, UpdateTaskRequest } from '../types/task.types';

export function useUpdateTask(
  workspaceId: string,
  projectId?: string,
  boardId?: string,
  onSuccessCallback?: (task: Task) => void,
) {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<Task>,
    AxiosError<ApiResponse<unknown>>,
    { taskId: string; data: UpdateTaskRequest }
  >({
    mutationFn: ({ taskId, data }) => taskApi.updateTask(taskId, data),
    onSuccess: (response, variables) => {
      const taskId = variables.taskId;

      // Invalidate specific task cache
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] });
      if (response.data?.key) {
        queryClient.invalidateQueries({ queryKey: ['tasks', response.data.key] });
      }

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

      toast.success(response.message || 'Task updated successfully!');
      if (onSuccessCallback && response.data) {
        onSuccessCallback(response.data);
      }
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || 'Failed to update task. Please try again.';
      toast.error(errorMessage);
    },
  });
}
