import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { ApiResponse, Workspace } from '@/types/domain';
import { workspaceApi } from '../api/workspace.api';
import { useWorkspaceStore } from '../stores/use-workspace-store';

export function useAcceptInvitation() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setActiveWorkspace = useWorkspaceStore((state) => state.setActiveWorkspace);

  return useMutation<
    ApiResponse<{ workspace: Workspace }>,
    AxiosError<ApiResponse<unknown>>,
    string
  >({
    mutationFn: (token: string) => workspaceApi.acceptInvitation(token),
    onSuccess: (response) => {
      const workspace = response.data?.workspace;
      queryClient.invalidateQueries({ queryKey: ['workspaces', 'my'] });
      toast.success(response.message || 'Successfully joined workspace!');
      if (workspace) {
        setActiveWorkspace(workspace);
        const slug = workspace.slug || workspace.id;
        router.push(`/workspaces/${slug}`);
      } else {
        router.push('/');
      }
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || 'Failed to accept invitation.';
      toast.error(errorMessage);
    },
  });
}
