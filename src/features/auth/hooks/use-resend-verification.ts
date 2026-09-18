import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import type { ApiResponse } from '@/types/domain';
import { formatApiErrorMessage } from '@/lib/api/api-error';
import { authApi, type ResendVerificationResponseData } from '../api/auth.api';
import type { ResendVerificationInput } from '../schemas/resend-verification.schema';

export function useResendVerification() {
  return useMutation<
    ApiResponse<ResendVerificationResponseData>,
    AxiosError<ApiResponse<unknown>>,
    ResendVerificationInput
  >({
    mutationFn: (data: ResendVerificationInput) => authApi.resendVerification(data),
    onSuccess: (response) => {
      toast.success(
        response.data?.message ||
          response.message ||
          'If an unverified account exists with this email, a verification link has been sent.',
        { duration: 6000 },
      );
    },
    onError: (error) => {
      const errorMessage = formatApiErrorMessage(
        error,
        'Failed to resend verification email. Please try again.',
      );
      toast.error(errorMessage);
    },
  });
}
