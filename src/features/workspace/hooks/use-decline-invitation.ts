import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { ApiResponse } from '@/types/domain';
import { workspaceApi } from '../api/workspace.api';

export function useDeclineInvitation() {
  const router = useRouter();

  return useMutation<
    ApiResponse<null>,
    AxiosError<ApiResponse<unknown>>,
    string
  >({
    mutationFn: (token: string) => workspaceApi.declineInvitation(token),
    onSuccess: (response) => {
      toast.success(response.message || 'Invitation declined.');
      router.push('/');
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || 'Failed to decline invitation.';
      toast.error(errorMessage);
    },
  });
}
