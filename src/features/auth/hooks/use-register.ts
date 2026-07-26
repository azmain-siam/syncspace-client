import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { ApiResponse } from '@/types/domain';
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
          'Registration successful! Please check your email to verify your account.',
        { duration: 6000 },
      );
      router.push('/login');
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        'Registration failed. Please check your information and try again.';
      toast.error(errorMessage);
    },
  });
}
