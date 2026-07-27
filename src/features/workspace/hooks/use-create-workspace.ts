import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { ApiResponse, Workspace } from '@/types/domain';
import { workspaceApi } from '../api/workspace.api';
import type { CreateWorkspaceInput } from '../schemas/create-workspace.schema';
import { useWorkspaceStore } from '../stores/use-workspace-store';

export function useCreateWorkspace(onSuccessCallback?: () => void) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setActiveWorkspace = useWorkspaceStore((state) => state.setActiveWorkspace);

  return useMutation<
    ApiResponse<Workspace>,
    AxiosError<ApiResponse<unknown>>,
    CreateWorkspaceInput
  >({
    mutationFn: (data: CreateWorkspaceInput) => workspaceApi.createWorkspace(data),
    onSuccess: (response) => {
      const workspace = response.data;
      if (workspace) {
        setActiveWorkspace(workspace);
        queryClient.invalidateQueries({ queryKey: ['workspaces', 'my'] });
        toast.success(response.message || `Workspace "${workspace.name}" created!`);
        if (onSuccessCallback) {
          onSuccessCallback();
        }
        router.push(`/workspaces/${workspace.id}`);
      }
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || 'Failed to create workspace. Please try again.';
      toast.error(errorMessage);
    },
  });
}
