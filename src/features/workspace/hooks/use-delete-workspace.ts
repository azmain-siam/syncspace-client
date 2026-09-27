import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { formatApiErrorMessage } from '@/lib/api/api-error';
import type { ApiResponse } from '@/types/domain';
import { workspaceApi } from '../api/workspace.api';
import { useWorkspaceStore } from '../stores/use-workspace-store';

export function useDeleteWorkspace(workspaceId?: string, onSuccessCallback?: () => void) {
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
      if (!id) throw new Error('Workspace ID is required to delete');
      return workspaceApi.deleteWorkspace(id);
    },
    onSuccess: (response, variables) => {
      const deletedId = variables || workspaceId;
      if (deletedId && activeWorkspaceId === deletedId) {
        clearWorkspace();
      }
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['workspaces', 'my'] });
      toast.success(response.message || 'Workspace deleted successfully.');
      if (onSuccessCallback) {
        onSuccessCallback();
      }
      router.push('/dashboard');
    },
    onError: (error) => {
      const errorMessage = formatApiErrorMessage(
        error,
        'Failed to delete workspace. Please try again.',
      );
      toast.error(errorMessage);
    },
  });
}
