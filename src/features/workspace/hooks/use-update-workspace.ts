import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import type { ApiResponse, Workspace } from '@/types/domain';
import { workspaceApi } from '../api/workspace.api';
import type { UpdateWorkspaceSettingsInput } from '../schemas/update-settings.schema';
import { useWorkspaceStore } from '../stores/use-workspace-store';

export function useUpdateWorkspace(workspaceId: string) {
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
        queryClient.invalidateQueries({ queryKey: ['workspaces', 'my'] });
        toast.success(response.message || 'Workspace settings saved!');
      }
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || 'Failed to update workspace settings.';
      toast.error(errorMessage);
    },
  });
}
