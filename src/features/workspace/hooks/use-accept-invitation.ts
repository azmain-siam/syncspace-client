import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { formatApiErrorMessage } from '@/lib/api/api-error';
import type { ApiResponse } from '@/types/domain';
import { workspaceApi } from '../api/workspace.api';
import { useWorkspaceStore } from '../stores/use-workspace-store';

export function useAcceptInvitation(onSuccessCallback?: () => void) {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<{ message: string }>,
    AxiosError<ApiResponse<unknown>>,
    string
  >({
    mutationFn: (token: string) => workspaceApi.acceptInvitation(token),
    onSuccess: async (response) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['workspaces'] }),
        queryClient.invalidateQueries({ queryKey: ['workspaces', 'my'] }),
      ]);

      toast.success(
        response.data?.message || response.message || 'Successfully joined workspace!',
      );

      if (onSuccessCallback) {
        onSuccessCallback();
      }

      try {
        const workspacesRes = await workspaceApi.getMyWorkspaces();
        const workspaces = workspacesRes?.data || [];
        if (workspaces.length > 0) {
          const target = workspaces[0];
          useWorkspaceStore.getState().setActiveWorkspace(target);
          const slug = target.slug || target.id;
          router.push(`/workspaces/${slug}`);
          return;
        }
      } catch {
        // Fallback to dashboard resolver
      }

      router.push('/dashboard');
    },
    onError: (error) => {
      const errorMessage = formatApiErrorMessage(
        error,
        'Failed to accept invitation. Please try again.',
      );
      toast.error(errorMessage);
    },
  });
}
