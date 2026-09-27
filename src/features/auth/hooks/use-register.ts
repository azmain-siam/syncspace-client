import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { ApiResponse } from '@/types/domain';
import { formatApiErrorMessage } from '@/lib/api/api-error';
import { authApi, type RegisterResponseData } from '../api/auth.api';
import type { RegisterInput } from '../schemas/register.schema';

export function useRegister() {
  const router = useRouter();

  return useMutation<
    ApiResponse<RegisterResponseData>,
    AxiosError<ApiResponse<unknown>>,
    RegisterInput
  >({
    mutationFn: (data: RegisterInput) => authApi.register(data),
    onSuccess: (response) => {
      toast.success(
        response.message ||
          response.data?.message ||
          'Registration successful! Please check your email to verify your account.',
        { duration: 6000 },
      );
      let destination = '/login';
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const redirectParam = params.get('redirect');
        if (redirectParam) {
          destination = `/login?redirect=${encodeURIComponent(redirectParam)}`;
        }
      }
      router.push(destination);
    },
    onError: (error) => {
      const errorMessage = formatApiErrorMessage(
        error,
        'Registration failed. Please check your information and try again.',
      );
      toast.error(errorMessage);
    },
  });
}
