import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import type { ApiResponse } from '@/types/domain';
import { authApi } from '../api/auth.api';
import type { ForgotPasswordInput } from '../schemas/forgot-password.schema';

export function useForgotPassword() {
  return useMutation<
    ApiResponse<{ message: string }>,
    AxiosError<ApiResponse<unknown>>,
    ForgotPasswordInput
  >({
    mutationFn: (data: ForgotPasswordInput) => authApi.forgotPassword(data),
    onSuccess: (response) => {
      toast.success(
        response.message ||
          'If an account exists, a password reset link has been sent.',
        { duration: 6000 },
      );
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        'Failed to request password reset. Please try again.';
      toast.error(errorMessage);
    },
  });
}
