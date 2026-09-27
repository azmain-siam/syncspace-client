import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import type { ApiResponse } from '@/types/domain';
import { taskApi } from '../api/task.api';
import type {
  Task,
  TaskChecklistItem,
  CreateChecklistItemRequest,
  UpdateChecklistItemRequest,
} from '../types/task.types';

// 1. Get checklist items
export function useChecklists(taskId?: string) {
  return useQuery({
    queryKey: ['tasks', taskId, 'checklists'],
    queryFn: async () => {
      if (!taskId) throw new Error('Task ID is required');
      return taskApi.getChecklists(taskId);
    },
    enabled: Boolean(taskId),
  });
}

// 2. Add checklist item
export function useAddChecklistItem(
  taskId: string,
  onSuccessCallback?: (item: TaskChecklistItem) => void,
) {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<TaskChecklistItem>,
    AxiosError<ApiResponse<unknown>>,
    CreateChecklistItemRequest
  >({
    mutationFn: (data: CreateChecklistItemRequest) =>
      taskApi.addChecklistItem(taskId, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId, 'checklists'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] });
      toast.success(response.message || 'Checklist item added');
      if (onSuccessCallback && response.data) {
        onSuccessCallback(response.data);
      }
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || 'Failed to add checklist item.';
      toast.error(errorMessage);
    },
  });
}

// 3. Update checklist item
export function useUpdateChecklistItem(
  taskId: string,
  onSuccessCallback?: () => void,
) {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<TaskChecklistItem>,
    AxiosError<ApiResponse<unknown>>,
    { itemId: string; data: UpdateChecklistItemRequest }
  >({
    mutationFn: ({ itemId, data }) =>
      taskApi.updateChecklistItem(taskId, itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId, 'checklists'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] });
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || 'Failed to update checklist item.';
      toast.error(errorMessage);
    },
  });
}

// 4. Toggle checklist item completion (Optimistic)
interface ToggleContext {
  previousChecklists?: ApiResponse<TaskChecklistItem[]>;
  previousTask?: ApiResponse<Task>;
}

export function useToggleChecklistItem(taskId: string) {
  const queryClient = useQueryClient();
  const checklistsKey = ['tasks', taskId, 'checklists'];
  const taskKey = ['tasks', taskId];

  return useMutation<
    ApiResponse<TaskChecklistItem>,
    AxiosError<ApiResponse<unknown>>,
    string, // itemId
    ToggleContext
  >({
    mutationFn: (itemId: string) => taskApi.toggleChecklistItem(taskId, itemId),

    onMutate: async (itemId: string) => {
      // Cancel in-flight queries
      await queryClient.cancelQueries({ queryKey: checklistsKey });
      await queryClient.cancelQueries({ queryKey: taskKey });

      // Snapshot
      const previousChecklists =
        queryClient.getQueryData<ApiResponse<TaskChecklistItem[]>>(checklistsKey);
      const previousTask = queryClient.getQueryData<ApiResponse<Task>>(taskKey);

      // Optimistically update checklists array
      if (previousChecklists?.data) {
        const updated = previousChecklists.data.map((item) =>
          item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item,
        );
        queryClient.setQueryData<ApiResponse<TaskChecklistItem[]>>(checklistsKey, {
          ...previousChecklists,
          data: updated,
        });
      }

      // Optimistically update inside task details
      if (previousTask?.data?.checklists) {
        const updated = previousTask.data.checklists.map((item) =>
          item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item,
        );
        queryClient.setQueryData<ApiResponse<Task>>(taskKey, {
          ...previousTask,
          data: {
            ...previousTask.data,
            checklists: updated,
          },
        });
      }

      return { previousChecklists, previousTask };
    },

    onError: (error, _itemId, context) => {
      if (context?.previousChecklists) {
        queryClient.setQueryData(checklistsKey, context.previousChecklists);
      }
      if (context?.previousTask) {
        queryClient.setQueryData(taskKey, context.previousTask);
      }
      toast.error('Failed to toggle checklist item.');
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: checklistsKey });
      queryClient.invalidateQueries({ queryKey: taskKey });
    },
  });
}

// 5. Delete checklist item
export function useDeleteChecklistItem(
  taskId: string,
  onSuccessCallback?: () => void,
) {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<null>,
    AxiosError<ApiResponse<unknown>>,
    string // itemId
  >({
    mutationFn: (itemId: string) => taskApi.deleteChecklistItem(taskId, itemId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId, 'checklists'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] });
      toast.success(response.message || 'Checklist item removed');
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || 'Failed to remove checklist item.';
      toast.error(errorMessage);
    },
  });
}
