import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import type { ApiResponse, User } from '@/types/domain';
import { authApi } from '../api/auth.api';

export function useVerifyEmail(token: string) {
  return useQuery<
    ApiResponse<{ user?: User }>,
    AxiosError<ApiResponse<unknown>>
  >({
    queryKey: ['auth', 'verify', token],
    queryFn: () => authApi.verifyEmail(token),
    enabled: !!token,
    retry: false,
    staleTime: Infinity,
  });
}
