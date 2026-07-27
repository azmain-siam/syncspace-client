import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import type { ApiResponse, WorkspaceInvitation } from '@/types/domain';
import { workspaceApi } from '../api/workspace.api';
import type { InviteMemberInput } from '../schemas/invite-member.schema';

export function useSendInvitation(workspaceId: string, onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<WorkspaceInvitation>,
    AxiosError<ApiResponse<unknown>>,
    InviteMemberInput
  >({
    mutationFn: (data: InviteMemberInput) =>
      workspaceApi.inviteMember(workspaceId, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces', workspaceId, 'members'] });
      toast.success(response.message || 'Invitation sent successfully!');
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || 'Failed to send invitation. Please try again.';
      toast.error(errorMessage);
    },
  });
}
