import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { ApiResponse } from '@/types/domain';
import { authApi, type LoginResponseData } from '../api/auth.api';
import type { LoginInput } from '../schemas/login.schema';
import { useAuthStore } from '../stores/use-auth-store';

export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation<
    ApiResponse<LoginResponseData>,
    AxiosError<ApiResponse<unknown>>,
    LoginInput
  >({
    mutationFn: (data: LoginInput) => authApi.login(data),
    onSuccess: (response) => {
      const { user, tokens } = response.data;
      setAuth(user, tokens.accessToken, tokens.refreshToken);
      queryClient.setQueryData(['user', 'me'], user);
      toast.success(response.message || 'Signed in successfully!');
      router.push('/');
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        'Failed to sign in. Please check your credentials.';
      toast.error(errorMessage);
    },
  });
}
