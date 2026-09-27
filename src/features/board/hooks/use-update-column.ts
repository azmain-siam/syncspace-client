import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import type { ApiResponse } from '@/types/domain';
import { boardApi } from '../api/board.api';
import type { BoardColumn, UpdateColumnRequest } from '../types/board.types';

interface UpdateColumnParams {
  columnId: string;
  data: UpdateColumnRequest;
}

export function useUpdateColumn(
  workspaceId: string,
  projectId: string,
  boardId: string,
  onSuccessCallback?: () => void,
) {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<BoardColumn>,
    AxiosError<ApiResponse<unknown>>,
    UpdateColumnParams
  >({
    mutationFn: ({ columnId, data }: UpdateColumnParams) =>
      boardApi.updateColumn(workspaceId, projectId, boardId, columnId, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: ['workspaces', workspaceId, 'projects', projectId, 'boards', boardId, 'columns'],
      });
      queryClient.invalidateQueries({
        queryKey: ['workspaces', workspaceId, 'projects', projectId, 'boards', boardId],
      });
      toast.success(response.message || 'Column updated successfully!');
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || 'Failed to update column. Please try again.';
      toast.error(errorMessage);
    },
  });
}
