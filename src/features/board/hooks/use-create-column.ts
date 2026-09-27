import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import type { ApiResponse } from '@/types/domain';
import { boardApi } from '../api/board.api';
import type { BoardColumn, CreateColumnRequest } from '../types/board.types';

export function useCreateColumn(
  workspaceId: string,
  projectId: string,
  boardId: string,
  onSuccessCallback?: () => void,
) {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<BoardColumn>,
    AxiosError<ApiResponse<unknown>>,
    CreateColumnRequest
  >({
    mutationFn: (data: CreateColumnRequest) =>
      boardApi.createColumn(workspaceId, projectId, boardId, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: ['workspaces', workspaceId, 'projects', projectId, 'boards', boardId, 'columns'],
      });
      queryClient.invalidateQueries({
        queryKey: ['workspaces', workspaceId, 'projects', projectId, 'boards', boardId],
      });
      toast.success(response.message || 'Column created successfully!');
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || 'Failed to create column. Please try again.';
      toast.error(errorMessage);
    },
  });
}
