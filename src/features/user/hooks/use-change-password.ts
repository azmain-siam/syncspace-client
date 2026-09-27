import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { ApiResponse, ChangePasswordRequest } from '@/types/domain';
import { formatApiErrorMessage } from '@/lib/api/api-error';
import { useAuthStore } from '@/features/auth/stores/use-auth-store';
import { useWorkspaceStore } from '@/features/workspace/stores/use-workspace-store';
import { userApi } from '../api/user.api';

export function useChangePassword() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);

  return useMutation<
    ApiResponse<{ message: string }>,
    AxiosError<ApiResponse<unknown>>,
    ChangePasswordRequest
  >({
    mutationFn: (data: ChangePasswordRequest) => userApi.changePassword(data),
    onSuccess: (response) => {
      toast.success(
        response.data?.message ||
          response.message ||
          'Password changed successfully. Please log in with your new password.',
        { duration: 6000 },
      );

      // Backend revokes active refresh tokens: cleanly purge client tokens & workspace state
      logout();
      useWorkspaceStore.getState().clearWorkspace();
      queryClient.clear();

      router.replace('/login?reason=password_changed');
    },
    onError: (error) => {
      const errorMessage = formatApiErrorMessage(
        error,
        'Failed to change password. Please check your credentials.',
      );
      toast.error(errorMessage);
    },
  });
}
