import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { formatApiErrorMessage } from '@/lib/api/api-error';
import type { ApiResponse } from '@/types/domain';
import { workspaceApi } from '../api/workspace.api';

export function useAcceptInvitation(onSuccessCallback?: () => void) {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<{ message: string }>,
    AxiosError<ApiResponse<unknown>>,
    string
  >({
    mutationFn: (token: string) => workspaceApi.acceptInvitation(token),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['workspaces', 'my'] });
      toast.success(
        response.data?.message || response.message || 'Successfully joined workspace!',
      );
      if (onSuccessCallback) {
        onSuccessCallback();
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
