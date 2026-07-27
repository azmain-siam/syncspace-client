import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import type { ApiResponse } from '@/types/domain';
import { workspaceApi } from '../api/workspace.api';

export function useRemoveMember(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<null>,
    AxiosError<ApiResponse<unknown>>,
    string
  >({
    mutationFn: (userId: string) => workspaceApi.removeMember(workspaceId, userId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces', workspaceId, 'members'] });
      toast.success(response.message || 'Member removed from workspace.');
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || 'Failed to remove member.';
      toast.error(errorMessage);
    },
  });
}
