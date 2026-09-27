import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { formatApiErrorMessage } from '@/lib/api/api-error';
import type { ApiResponse, DirectAddMemberRequest, WorkspaceMember } from '@/types/domain';
import { workspaceApi } from '../api/workspace.api';

export function useDirectAddMember(workspaceId: string, onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<WorkspaceMember>,
    AxiosError<ApiResponse<unknown>>,
    DirectAddMemberRequest
  >({
    mutationFn: (data: DirectAddMemberRequest) =>
      workspaceApi.directAddMember(workspaceId, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces', workspaceId, 'members'] });
      toast.success(response.message || 'Member added to workspace successfully!');
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (error) => {
      const errorMessage = formatApiErrorMessage(
        error,
        'Failed to add member to workspace. Please try again.',
      );
      toast.error(errorMessage);
    },
  });
}
