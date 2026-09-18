import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { formatApiErrorMessage } from '@/lib/api/api-error';
import type { ApiResponse } from '@/types/domain';
import { workspaceApi } from '../api/workspace.api';

export function useDeclineInvitation(onSuccessCallback?: () => void) {
  const router = useRouter();

  return useMutation<
    ApiResponse<{ message: string }>,
    AxiosError<ApiResponse<unknown>>,
    string
  >({
    mutationFn: (token: string) => workspaceApi.declineInvitation(token),
    onSuccess: (response) => {
      toast.success(
        response.data?.message || response.message || 'Invitation declined.',
      );
      if (onSuccessCallback) {
        onSuccessCallback();
      }
      router.push('/dashboard');
    },
    onError: (error) => {
      const errorMessage = formatApiErrorMessage(
        error,
        'Failed to decline invitation. Please try again.',
      );
      toast.error(errorMessage);
    },
  });
}
