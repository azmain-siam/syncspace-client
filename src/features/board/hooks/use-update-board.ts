import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import type { ApiResponse } from '@/types/domain';
import { boardApi } from '../api/board.api';
import type { Board, UpdateBoardRequest } from '../types/board.types';

export function useUpdateBoard(
  workspaceId: string,
  projectId: string,
  boardId: string,
  onSuccessCallback?: () => void,
) {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<Board>,
    AxiosError<ApiResponse<unknown>>,
    UpdateBoardRequest
  >({
    mutationFn: (data: UpdateBoardRequest) =>
      boardApi.updateBoard(workspaceId, projectId, boardId, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: ['workspaces', workspaceId, 'projects', projectId, 'boards'],
      });
      queryClient.invalidateQueries({
        queryKey: ['workspaces', workspaceId, 'projects', projectId, 'boards', boardId],
      });
      toast.success(response.message || 'Board updated successfully!');
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || 'Failed to update board. Please try again.';
      toast.error(errorMessage);
    },
  });
}
