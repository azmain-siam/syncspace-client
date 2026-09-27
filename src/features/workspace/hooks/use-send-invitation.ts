import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { formatApiErrorMessage } from '@/lib/api/api-error';
import type { ApiResponse, SendInvitationResponse } from '@/types/domain';
import { workspaceApi } from '../api/workspace.api';
import type { InviteMemberInput } from '../schemas/invite-member.schema';

export function useSendInvitation(workspaceId: string, onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<SendInvitationResponse>,
    AxiosError<ApiResponse<unknown>>,
    InviteMemberInput
  >({
    mutationFn: (data: InviteMemberInput) =>
      workspaceApi.inviteMember(workspaceId, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces', workspaceId, 'members'] });
      queryClient.invalidateQueries({ queryKey: ['workspaces', workspaceId, 'invitations'] });
      toast.success(
        response.data?.message || response.message || 'Invitation sent successfully!',
      );
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (error) => {
      const errorMessage = formatApiErrorMessage(
        error,
        'Failed to send invitation. Please try again.',
      );
      toast.error(errorMessage);
    },
  });
}
