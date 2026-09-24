import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import type { ApiResponse } from '@/types/domain';
import { taskApi } from '../api/task.api';
import { columnKeys } from './task-keys';
import type { Task, CreateTaskRequest } from '../types/task.types';

export function useCreateTask(
  workspaceId: string,
  projectId: string,
  boardId: string,
  onSuccessCallback?: (task: Task) => void,
) {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<Task>,
    AxiosError<ApiResponse<unknown>>,
    { columnId: string; data: CreateTaskRequest }
  >({
    mutationFn: ({ columnId, data }) => taskApi.createTask(columnId, data),
    onSuccess: (response, variables) => {
      // Invalidate board details so column cards refresh
      queryClient.invalidateQueries({
        queryKey: ['workspaces', workspaceId, 'projects', projectId, 'boards', boardId],
      });
      // Invalidate board columns
      queryClient.invalidateQueries({
        queryKey: ['workspaces', workspaceId, 'projects', projectId, 'boards', boardId, 'columns'],
      });
      // Invalidate specific column tasks if cached
      queryClient.invalidateQueries({
        queryKey: columnKeys.columnTasks(variables.columnId),
      });
      // Invalidate personal inbox
      queryClient.invalidateQueries({
        queryKey: ['workspaces', workspaceId, 'my-tasks'],
      });

      toast.success(response.message || 'Task created successfully!');
      if (onSuccessCallback && response.data) {
        onSuccessCallback(response.data);
      }
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || 'Failed to create task. Please try again.';
      toast.error(errorMessage);
    },
  });
}
