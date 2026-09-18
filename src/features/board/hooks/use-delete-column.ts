import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import type { ApiResponse } from '@/types/domain';
import { boardApi } from '../api/board.api';

export function useDeleteColumn(
  workspaceId: string,
  projectId: string,
  boardId: string,
  onSuccessCallback?: () => void,
) {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<null>,
    AxiosError<ApiResponse<unknown>>,
    string
  >({
    mutationFn: (columnId: string) =>
      boardApi.deleteColumn(workspaceId, projectId, boardId, columnId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: ['workspaces', workspaceId, 'projects', projectId, 'boards', boardId, 'columns'],
      });
      queryClient.invalidateQueries({
        queryKey: ['workspaces', workspaceId, 'projects', projectId, 'boards', boardId],
      });
      toast.success(response.message || 'Column deleted successfully!');
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || 'Failed to delete column. Please try again.';
      toast.error(errorMessage);
    },
  });
}
