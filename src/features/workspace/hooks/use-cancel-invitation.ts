import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { formatApiErrorMessage } from '@/lib/api/api-error';
import type { ApiResponse } from '@/types/domain';
import { workspaceApi } from '../api/workspace.api';

export function useCancelInvitation(workspaceId: string, onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<{ message: string }>,
    AxiosError<ApiResponse<unknown>>,
    string
  >({
    mutationFn: (invitationId: string) =>
      workspaceApi.cancelInvitation(workspaceId, invitationId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces', workspaceId, 'invitations'] });
      queryClient.invalidateQueries({ queryKey: ['workspaces', workspaceId, 'members'] });
      toast.success(response.data?.message || response.message || 'Invitation cancelled successfully.');
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (error) => {
      const errorMessage = formatApiErrorMessage(
        error,
        'Failed to cancel invitation. Please try again.',
      );
      toast.error(errorMessage);
    },
  });
}
