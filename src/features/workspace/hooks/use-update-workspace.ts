import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { formatApiErrorMessage } from '@/lib/api/api-error';
import type { ApiResponse, Workspace } from '@/types/domain';
import { workspaceApi } from '../api/workspace.api';
import type { UpdateWorkspaceSettingsInput } from '../schemas/update-settings.schema';
import { useWorkspaceStore } from '../stores/use-workspace-store';

export function useUpdateWorkspace(workspaceId: string, onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();
  const setActiveWorkspace = useWorkspaceStore((state) => state.setActiveWorkspace);

  return useMutation<
    ApiResponse<Workspace>,
    AxiosError<ApiResponse<unknown>>,
    UpdateWorkspaceSettingsInput
  >({
    mutationFn: (data: UpdateWorkspaceSettingsInput) =>
      workspaceApi.updateWorkspaceSettings(workspaceId, data),
    onSuccess: (response) => {
      const workspace = response.data;
      if (workspace) {
        setActiveWorkspace(workspace);
        queryClient.invalidateQueries({ queryKey: ['workspaces'] });
        queryClient.invalidateQueries({ queryKey: ['workspaces', 'my'] });
        queryClient.invalidateQueries({ queryKey: ['workspaces', workspaceId] });
        toast.success(response.message || 'Workspace settings saved!');
        if (onSuccessCallback) {
          onSuccessCallback();
        }
      }
    },
    onError: (error) => {
      const errorMessage = formatApiErrorMessage(
        error,
        'Failed to update workspace settings. Please try again.',
      );
      toast.error(errorMessage);
    },
  });
}
