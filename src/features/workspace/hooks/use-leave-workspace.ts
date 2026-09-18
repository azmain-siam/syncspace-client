import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { formatApiErrorMessage } from '@/lib/api/api-error';
import type { ApiResponse } from '@/types/domain';
import { workspaceApi } from '../api/workspace.api';
import { useWorkspaceStore } from '../stores/use-workspace-store';

export function useLeaveWorkspace(workspaceId?: string, onSuccessCallback?: () => void) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { activeWorkspaceId, clearWorkspace } = useWorkspaceStore();

  return useMutation<
    ApiResponse<null>,
    AxiosError<ApiResponse<unknown>>,
    string | undefined
  >({
    mutationFn: (targetWorkspaceId) => {
      const id = targetWorkspaceId || workspaceId;
      if (!id) throw new Error('Workspace ID is required to leave');
      return workspaceApi.leaveWorkspace(id);
    },
    onSuccess: (response, variables) => {
      const leftId = variables || workspaceId;
      if (leftId && activeWorkspaceId === leftId) {
        clearWorkspace();
      }
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['workspaces', 'my'] });
      toast.success(response.message || 'Left workspace successfully.');
      if (onSuccessCallback) {
        onSuccessCallback();
      }
      router.push('/dashboard');
    },
    onError: (error) => {
      const errorMessage = formatApiErrorMessage(
        error,
        'Failed to leave workspace. Please try again.',
      );
      toast.error(errorMessage);
    },
  });
}
