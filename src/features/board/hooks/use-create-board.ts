import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import type { ApiResponse } from '@/types/domain';
import { boardApi } from '../api/board.api';
import type { Board, CreateBoardRequest } from '../types/board.types';

export function useCreateBoard(
  workspaceId: string,
  projectId: string,
  onSuccessCallback?: (board: Board) => void,
) {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<Board>,
    AxiosError<ApiResponse<unknown>>,
    CreateBoardRequest
  >({
    mutationFn: (data: CreateBoardRequest) =>
      boardApi.createBoard(workspaceId, projectId, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: ['workspaces', workspaceId, 'projects', projectId, 'boards'],
      });
      toast.success(response.message || 'Board created successfully!');
      if (onSuccessCallback && response.data) {
        onSuccessCallback(response.data);
      }
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || 'Failed to create board. Please try again.';
      toast.error(errorMessage);
    },
  });
}
