import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import type { ApiResponse } from '@/types/domain';
import { authApi, type VerifyEmailResponseData } from '../api/auth.api';

export function useVerifyEmail(token: string) {
  return useQuery<
    ApiResponse<VerifyEmailResponseData>,
    AxiosError<ApiResponse<unknown>>
  >({
    queryKey: ['auth', 'verify', token],
    queryFn: () => authApi.verifyEmail(token),
    enabled: !!token,
    retry: false,
    staleTime: Infinity,
  });
}
