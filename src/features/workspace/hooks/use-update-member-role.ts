import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import type { ApiResponse, WorkspaceMember, WorkspaceRole } from '@/types/domain';
import { workspaceApi } from '../api/workspace.api';

export function useUpdateMemberRole(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<WorkspaceMember>,
    AxiosError<ApiResponse<unknown>>,
    { memberId: string; role: WorkspaceRole }
  >({
    mutationFn: ({ memberId, role }) =>
      workspaceApi.updateMemberRole(workspaceId, memberId, role),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces', workspaceId, 'members'] });
      toast.success(response.message || 'Member role updated successfully!');
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || 'Failed to update member role.';
      toast.error(errorMessage);
    },
  });
}
