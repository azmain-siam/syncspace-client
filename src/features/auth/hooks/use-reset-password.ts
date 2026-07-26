import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { ApiResponse } from '@/types/domain';
import { authApi } from '../api/auth.api';
import type { ResetPasswordInput } from '../schemas/reset-password.schema';

export function useResetPassword() {
  const router = useRouter();

  return useMutation<
    ApiResponse<{ message: string }>,
    AxiosError<ApiResponse<unknown>>,
    ResetPasswordInput
  >({
    mutationFn: (data: ResetPasswordInput) => authApi.resetPassword(data),
    onSuccess: (response) => {
      toast.success(
        response.message ||
          'Password reset successfully! You can now sign in with your new password.',
      );
      router.push('/login');
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        'Failed to reset password. The link may have expired.';
      toast.error(errorMessage);
    },
  });
}
