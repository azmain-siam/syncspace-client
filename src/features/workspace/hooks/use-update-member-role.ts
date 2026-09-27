import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { formatApiErrorMessage } from '@/lib/api/api-error';
import type { ApiResponse, WorkspaceRole } from '@/types/domain';
import { workspaceApi } from '../api/workspace.api';

export function useUpdateMemberRole(workspaceId: string, onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<null>,
    AxiosError<ApiResponse<unknown>>,
    { memberId: string; role: WorkspaceRole }
  >({
    mutationFn: ({ memberId, role }) =>
      workspaceApi.updateMemberRole(workspaceId, memberId, role),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces', workspaceId, 'members'] });
      toast.success(response.message || 'Member role updated successfully!');
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (error) => {
      const errorMessage = formatApiErrorMessage(
        error,
        'Failed to update member role. Please try again.',
      );
      toast.error(errorMessage);
    },
  });
}
